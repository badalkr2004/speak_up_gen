-- Seed pluggable local team kinds (run after migrate)
INSERT INTO unit_kind (id, key, label, description, is_active)
VALUES
  ('uk_campus', 'campus', 'Campus team', 'Students organising from a campus', 1),
  ('uk_college', 'college', 'College team', 'College or university chapter', 1),
  ('uk_community', 'community', 'Community team', 'Neighbourhood or locality group', 1),
  ('uk_workplace', 'workplace', 'Workplace team', 'Young professionals at a workplace', 1),
  ('uk_club', 'club', 'Club team', 'Interest or activity club', 1),
  ('uk_partner', 'partner', 'Partner team', 'Partner organisation under Speak Up Gen', 1),
  ('uk_custom', 'custom', 'Custom team', 'Other youth team that fits the mission', 1)
ON CONFLICT (key) DO NOTHING;
