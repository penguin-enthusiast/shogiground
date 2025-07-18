## v0.10.3

- Highlight pieces in 'last-dest' only if `s.highlight.lastDests` is enabled.
- Fix removing pieces from hand when dropping spare pieces.

## v0.10.2

- Fixed confusing and wrong behavior of `state.droppable.spare`.
- Pieces in hand now can also have 'last-dest' highlight using `lastPiece` in state.

## v0.10.1

- Added `dizhi` notation system (max 12 ranks/files).
- Charset of dist files is now utf-8 - relevant for kanji coords.

## v0.10.0

- `Notation` is now a string - `'numeric' | 'japanese' | 'engine' | 'hex'`, not a const enum.
- `notation.ts` no longer exists, `coords` function is now in `coords.ts` and `Notation` type is in `types.ts`.

## v0.9.0

- Files are now built to `esm` directory.
- Constants were moved from `types.ts` into `constants.ts`.
- `Notation` was moved from `types.ts` into `notation.ts`.
- Type guards were moved from `types.ts` into `util.ts`.
- `allKeys` was moved from `util.ts` into `constants.ts`.

## v0.8.6

- Fixed possible division by zero resulting in NaN positions, while calculating positions of outside elements, that have no width/height.

## v0.8.5

- Added to `drawable.forced` to config. When set to true moving/dropping is not possible and only shapes will be drawn.
- Dependencies bumped.

## v0.8.4

- Added `unpromotesTo` to `promotion` in config. If a piece can't be added to or removed from hand, due to not being in `hands.roles`, unpromotion will be attempted. Return `undefined` by default.
- Calling `selectPiece` in api now correctly always selects specified piece and unselects only when null is provided.
- Added `addSparesToHand` to `selectable` in config. If true - clicking on a piece in hand while having a spare piece selected will result in adding the spare piece's role to hand. Defaults to `false`.
- Dependencies bumped.

## v0.8.3

- Fix square rendering for non-square boards (https://github.com/WandererXII/shogiground/pull/10).
- Dependencies updated.

## v0.8.2

- Added `shogiground.js` and `shogiground.min.js` in dist to npm.

## v0.8.1

- Fix redrawing with multiple instances of shogiground.

## v0.8.0

- Renamed `cancelMove` to `cancelMoveOrDrop` to better reflect what it actually does.
- Added an option to drop spare pieces (`selectabled.forceSpares`) by selecting a square even with selectable disabled.

## v0.7.1

- Inlined hand wrapper element (`sg-hand-wrap`) now has `inlined` class.

## v0.7.0

- Brush is also added as class to custom svgs.
- 'primary' brush class is added for arrows containing empty brush name.
- Each shape is now inside `g` element. Brush names (classes) and `sgHash` are assigned to these `g` elements - you need to update css.

## v0.6.2

- Fix `highlight.checkRoles` not being optional in `config`

## v0.6.1

- `config.checks` can now also takes `Color` or `boolean` - roles to highlight can be set in`highlight.checkRoles`
- Don't add hover class to squares, when not necessary
- Export canPremove and canPredrop
- Fix `checks` in `config`

## v0.6.0

- Remove `premove` and `predrop` included functions, now you have to pass a function that will be called, this truly removes shogi logic from shogiground.
- Remove `Role` type, now it's just `string`, again - removes shogi logic from shogiground, custom parsers for sfen must be used, but default is provided for standard shogi.
- Max size of the board extended to 16x16.
- `DropDests` use `PieceName` as a key, not role.
- `check` changed to `checks`, takes only `Key[]` now.
- Callback event - `unselect` and `unselectPiece` - triggered only when we unselect directly on the orig square/piece.
- Hex notation for coords added.
- Files and ranks notation are now set separately.
- Add description option to shapes - mainly for promotion ('+').
- Rename `Dests` to `MoveDests`.
- Changelog started.
