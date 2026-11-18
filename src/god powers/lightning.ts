// Auto-converted from lightning.xmb (Age of Mythology XMB God Power Definition)
// Zeus's signature god power — Bolt of Zeus (Raio de Zeus)
export const lightningPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Lightning",
    "techname": "lightning",
    "type": "lightning"
  },
  "children": [
    {
      "tag": "builduptime",
      "value": "0.5"
    },
    {
      "tag": "activetime",
      "value": "1.0"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "unit"
    },
    {
      "tag": "radius",
      "value": "2.0"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "StartSound"
      },
      "value": "LightningBolt"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "EndSound"
      },
      "value": "GodPowerEnd"
    },
    {
      "tag": "boltsfx",
      "value": "Zeus Bolt SFX"
    },
    {
      "tag": "boltgraph",
      "value": "Zeus Lightning Strike"
    },
    {
      "tag": "playsbattlemusic"
    },
    {
      "tag": "gpdamagemodel",
      "children": [
        {
          "tag": "playerrelation",
          "value": "enemy"
        },
        {
          "tag": "basedamagepercentunit",
          "value": "1.0"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "1.0"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.6"
        },
        {
          "tag": "minhpdamageunit",
          "value": "2500"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "1200"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "3500"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "7500"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "3500"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "8000"
        }
      ]
    },
    {
      "tag": "accuracy",
      "value": "1.0"
    },
    {
      "tag": "camerashake",
      "attributes": {
        "duration": "0.35",
        "strength": "0.45"
      }
    },
    {
      "tag": "powerblocker",
      "value": "0.0f"
    },
    {
      "tag": "icon",
      "value": "god power lightning icon"
    },
    {
      "tag": "usedicon",
      "value": "god power lightning icon done"
    }
  ]
} as const;
export default lightningPowerXmb;
