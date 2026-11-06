"use client";

import * as THREE from "three";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import {
  BADGE_H,
  BADGE_SLOT_Y,
  createBadgeTexture,
  createBadgeTextureSync,
  createBandTexture,
  loadBrandFont,
  type BadgeTextureInput,
} from "@/app/components/id-card/create-badge-texture";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: object;
    meshLineMaterial: Record<string, unknown>;
  }
}

type DragOffset = THREE.Vector3 | false;

type RigidBodyWithLerp = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

const CARD_W = 2.5;
const CARD_H = (CARD_W * BADGE_H) / 1024;
const CARD_D = 0.03;
/** Slot centre, in card-local units. */
const SLOT_Y = CARD_H / 2 - (BADGE_SLOT_Y / BADGE_H) * CARD_H;
const RING_R = 0.11;
const RING_Y = SLOT_Y + RING_R - 0.02;
const CLAMP_H = 0.2;
const CLAMP_Y = RING_Y + RING_R + CLAMP_H / 2 - 0.02;
/** Where the strap enters the clamp; also the physics joint anchor. */
const STRAP_Y = CLAMP_Y + CLAMP_H / 2 - 0.04;

const METAL = { color: "#d4d7dc", metalness: 1, roughness: 0.22 } as const;

export type LanyardSceneProps = {
  member: BadgeTextureInput;
};

export function LanyardScene({ member }: LanyardSceneProps) {
  return (
    <div className="relative h-dvh w-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 13], fov: 25 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor("#000000")}
      >
        <ambientLight intensity={Math.PI} />
        {/* Step physics before Band reads body positions each frame */}
        <Physics
          interpolate
          gravity={[0, -40, 0]}
          timeStep={1 / 60}
          updatePriority={-1}
        >
          <Band member={member} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({
  member,
  maxSpeed = 50,
  minSpeed = 10,
}: {
  member: BadgeTextureInput;
  maxSpeed?: number;
  minSpeed?: number;
}) {
  const band = useRef<THREE.Mesh>(null);
  const strapAnchor = useRef<THREE.Object3D>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RigidBodyWithLerp>(null);
  const j2 = useRef<RigidBodyWithLerp>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);

  const vec = useRef(new THREE.Vector3()).current;
  const ang = useRef(new THREE.Vector3()).current;
  const rot = useRef(new THREE.Vector3()).current;
  const dir = useRef(new THREE.Vector3()).current;

  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 2,
    linearDamping: 2,
  };

  const { width, height } = useThree((s) => s.size);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  curve.curveType = "chordal";

  const [dragged, drag] = useState<DragOffset>(false);
  const [hovered, hover] = useState(false);

  const badgeMap = useBadgeMap(member);
  const bandMap = useBandMap();

  useRopeJoint(
    fixed as MutableRefObject<RapierRigidBody>,
    j1 as MutableRefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0, 0], 1],
  );
  useRopeJoint(
    j1 as MutableRefObject<RapierRigidBody>,
    j2 as MutableRefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0, 0], 1],
  );
  useRopeJoint(
    j2 as MutableRefObject<RapierRigidBody>,
    j3 as MutableRefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0, 0], 1],
  );
  useSphericalJoint(
    j3 as MutableRefObject<RapierRigidBody>,
    card as MutableRefObject<RapierRigidBody>,
    [
      [0, 0, 0],
      [0, STRAP_Y, 0],
    ],
  );

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (
      !fixed.current ||
      !j1.current ||
      !j2.current ||
      !card.current ||
      !band.current ||
      !strapAnchor.current
    ) {
      return;
    }

    for (const ref of [j1, j2] as const) {
      const body = ref.current!;
      if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
      const d = Math.max(0.1, Math.min(1, body.lerped.distanceTo(body.translation())));
      body.lerped.lerp(
        body.translation(),
        delta * (minSpeed + d * (maxSpeed - minSpeed)),
      );
    }

    // The card mesh is drawn at an interpolated pose, while translation() is the raw
    // physics pose. Reading the strap tip from the rendered card keeps the two glued.
    strapAnchor.current.getWorldPosition(curve.points[0]);
    curve.points[1].copy(j2.current.lerped!);
    curve.points[2].copy(j1.current.lerped!);
    curve.points[3].copy(fixed.current.translation());
    ;(band.current.geometry as unknown as MeshLineGeometry).setPoints(
      curve.getPoints(32),
    );

    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel(
      { x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z },
      true,
    );
  });

  return (
    <>
      <group position={[0, 4.4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_D / 2]} />
          <group
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.target as Element).setPointerCapture(e.pointerId);
              if (!card.current) return;
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation())),
              );
            }}
          >
            <object3D ref={strapAnchor} position={[0, STRAP_Y, 0]} />

            <mesh>
              <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
              <meshStandardMaterial attach="material-0" color="#1c1c1c" roughness={0.6} />
              <meshStandardMaterial attach="material-1" color="#1c1c1c" roughness={0.6} />
              <meshStandardMaterial attach="material-2" color="#1c1c1c" roughness={0.6} />
              <meshStandardMaterial attach="material-3" color="#1c1c1c" roughness={0.6} />
              {/* Unlit face so the print shows its true colours */}
              <meshBasicMaterial attach="material-4" map={badgeMap} toneMapped={false} />
              <meshStandardMaterial attach="material-5" color="#0e0e0e" roughness={0.8} />
            </mesh>
            {/* Thin gloss layer for a laminated look without washing out the print */}
            <mesh position={[0, 0, CARD_D / 2 + 0.002]}>
              <planeGeometry args={[CARD_W, CARD_H]} />
              <meshPhysicalMaterial
                transparent
                opacity={0.08}
                color="#ffffff"
                roughness={0.15}
                clearcoat={1}
                depthWrite={false}
              />
            </mesh>

            <Clip />
          </group>
        </RigidBody>
      </group>

      {/* depthTest is off, so draw order is pinned: card → strap → clip */}
      <mesh ref={band} renderOrder={1} frustumCulled={false}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap={1}
          map={bandMap}
          repeat={[-5, 1]}
          lineWidth={1.1}
        />
      </mesh>
    </>
  );
}

function Clip() {
  return (
    <group position={[0, 0, CARD_D / 2 + 0.03]}>
      <mesh position={[0, RING_Y, 0]} renderOrder={2}>
        <torusGeometry args={[RING_R, 0.018, 16, 48]} />
        <meshStandardMaterial {...METAL} depthTest={false} />
      </mesh>
      <mesh position={[0, CLAMP_Y, 0]} renderOrder={2}>
        <boxGeometry args={[0.26, CLAMP_H, 0.05]} />
        <meshStandardMaterial {...METAL} depthTest={false} />
      </mesh>
      <mesh position={[0, CLAMP_Y - CLAMP_H / 2 + 0.03, 0.03]} renderOrder={3}>
        <cylinderGeometry args={[0.018, 0.018, 0.27, 12]} />
        <meshStandardMaterial color="#9ea2a8" metalness={1} roughness={0.35} depthTest={false} />
      </mesh>
    </group>
  );
}

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function useBadgeMap(member: BadgeTextureInput) {
  const [map, setMap] = useState(() => toTexture(createBadgeTextureSync(member)));

  useEffect(() => {
    let alive = true;
    setMap(toTexture(createBadgeTextureSync(member)));
    void createBadgeTexture(member).then((canvas) => {
      if (alive) setMap(toTexture(canvas));
    });
    return () => {
      alive = false;
    };
  }, [
    member.name,
    member.memberCode,
    member.role,
    member.unitName,
    member.kindLabel,
    member.photoUrl,
    member.userImage,
  ]);

  useEffect(() => () => map.dispose(), [map]);

  return map;
}

function makeBandTexture() {
  const texture = toTexture(createBandTexture());
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function useBandMap() {
  const [map, setMap] = useState(makeBandTexture);

  useEffect(() => {
    let alive = true;
    void loadBrandFont().then(() => {
      if (alive) setMap(makeBandTexture());
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => () => map.dispose(), [map]);
  return map;
}
