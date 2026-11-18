// Auto-converted from solar beam.xmb (Age of Mythology XMB God Power Definition)
// Apolo (Greek Age 3) & Hélios (Atlantean Age 4) — Raio Solar: focused beam of divine light
export const solarBeamPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Solar Beam",
    "techname": "solar_beam",
    "type": "solar_beam"
  },
  "children": [
    {
      "tag": "builduptime",
      "attributes": {
        "soundset": "SolarBeamCharge"
      },
      "value": "2.0"
    },
    {
      "tag": "activetime",
      "value": "8.0"
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
      "value": "10.0"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "StartSound"
      },
      "value": "SolarBeamFire"
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
      "tag": "beamgraph",
      "value": "Apollo Solar Beam VFX"
    },
    {
      "tag": "sunscourchfx",
      "value": "Solar Scorch Ground SFX"
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
          "value": "0.90"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.90"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.75"
        },
        {
          "tag": "minhpdamageunit",
          "value": "2200"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "1000"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "5000"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "6500"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "2800"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "12000"
        }
      ]
    },
    {
      "tag": "burnrate",
      "value": "0.055"
    },
    {
      "tag": "burnduration",
      "value": "8.0"
    },
    {
      "tag": "burninterval",
      "value": "1.0"
    },
    {
      "tag": "accuracy",
      "value": "0.95"
    },
    {
      "tag": "camerashake",
      "attributes": {
        "duration": "0.5",
        "strength": "0.35"
      }
    },
    {
      "tag": "powerblocker",
      "value": "30.0f"
    },
    {
      "tag": "icon",
      "value": "god power solar beam icon"
    },
    {
      "tag": "usedicon",
      "value": "god power solar beam icon done"
    }
  ]
} as const;
export default solarBeamPowerXmb;
