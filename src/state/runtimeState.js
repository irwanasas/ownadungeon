// Ephemeral, non-persisted session state shared across UI/combat modules.
// Kept as a single mutable object (rather than separate exported `let`
// bindings) so any module can update a field — an ES module can only
// reassign bindings it owns, but every module may mutate a shared object's
// properties.
export const runtime = {
  selectedPaletteItem: null,
  raidInProgress: false
};
