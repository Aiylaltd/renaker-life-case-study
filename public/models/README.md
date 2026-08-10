# 3D models

Drop production assets here. Paths are configured in `src/config/scene.ts`.

## Expected layout

```
manchester.glb          # city + named ANCHOR_* nodes
renaker/
  dgs.glb
  360.glb
  blade.glb
  vrg.glb
  crownst.glb
  bankside.glb
  cw.glb
aiyla-orb.glb           # optional finale asset
```

## Required named nodes in manchester.glb

`ANCHOR_DGS`, `ANCHOR_360`, `ANCHOR_BLADE`, `ANCHOR_VRG`, `ANCHOR_CROWNST`, `ANCHOR_BANKSIDE`, `ANCHOR_CW`, `ANCHOR_BIZ1`, `ANCHOR_BIZ2`, `ANCHOR_BIZ3`

When files are ready:

1. Place them in this folder
2. Set `sceneAssets.enableGlbLoading = true` in `src/config/scene.ts`
3. Wire `useGLTF` load + `AnchorRegistry.ingestScene(gltf.scene)` in `SceneManager`
4. Tune camera compositions only
