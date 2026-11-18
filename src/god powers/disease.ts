// Auto-converted from disease.xmb (Age of Mythology XMB God Power Definition)
// Anúbis (Egyptian Age 2) — Doença: spreads a plague that corrodes enemy units over time
export const diseasePowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Disease",
    "techname": "disease",
    "type": "disease"
  },
  "children": [
    {
      "tag": "builduptime",
      "value": "1.0"
    },
    {
      "tag": "activetime",
      "value": "20.0"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "full"
    },
    {
      "tag": "radius",
      "value": "12.0"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "AllExceptCaster",
        "type": "StartSound"
      },
      "value": "GodPowerStart"
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
      "tag": "plaguesfx",
      "value": "Anubis Disease SFX"
    },
    {
      "tag": "poisoncloud",
      "value": "Disease Cloud VFX"
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
          "value": "0.55"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.65"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.0"
        },
        {
          "tag": "minhpdamageunit",
          "value": "1000"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "600"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "0"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "3200"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "1800"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "0"
        }
      ]
    },
    {
      "tag": "dotinterval",
      "value": "2.0"
    },
    {
      "tag": "dotduration",
      "value": "20.0"
    },
    {
      "tag": "dotdamagepct",
      "value": "0.038"
    },
    {
      "tag": "spreadradius",
      "value": "5.0"
    },
    {
      "tag": "speedpenaltypct",
      "value": "0.20"
    },
    {
      "tag": "scantime",
      "value": "1.0"
    },
    {
      "tag": "powerblocker",
      "value": "25.0f"
    },
    {
      "tag": "icon",
      "value": "god power disease icon"
    },
    {
      "tag": "usedicon",
      "value": "god power disease icon done"
    }
  ]
} as const;
export default diseasePowerXmb;
