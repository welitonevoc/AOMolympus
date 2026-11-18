// Auto-converted from black hole.xmb (Age of Mythology XMB God Power Definition)
// Hécate (Atlantean Age 4) — Buraco Negro: pulls enemies into a gravitational singularity
export const blackHolePowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Black Hole",
    "techname": "black_hole",
    "type": "black_hole"
  },
  "children": [
    {
      "tag": "builduptime",
      "value": "1.5"
    },
    {
      "tag": "activetime",
      "value": "16.0"
    },
    {
      "tag": "shutdowntime",
      "value": "0.5"
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
        "listenertype": "All",
        "type": "StartSound"
      },
      "value": "BlackHoleStart"
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
      "tag": "singularitysfx",
      "value": "Hecate Black Hole SFX"
    },
    {
      "tag": "gravitypull",
      "value": "0.95"
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
          "value": "0.72"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.72"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.45"
        },
        {
          "tag": "minhpdamageunit",
          "value": "1800"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "800"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "4500"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "5000"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "2000"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "10000"
        }
      ]
    },
    {
      "tag": "minthrowdistance",
      "value": "2.0"
    },
    {
      "tag": "maxthrowdistance",
      "value": "5.0"
    },
    {
      "tag": "minthrowheight",
      "value": "1.0"
    },
    {
      "tag": "maxthrowheight",
      "value": "4.0"
    },
    {
      "tag": "minthrowvelocity",
      "value": "5.0"
    },
    {
      "tag": "maxthrowvelocity",
      "value": "12.0"
    },
    {
      "tag": "dontthrow",
      "value": "Building"
    },
    {
      "tag": "camerashake",
      "attributes": {
        "duration": "0.6",
        "strength": "0.3"
      }
    },
    {
      "tag": "powerblocker",
      "value": "35.0f"
    },
    {
      "tag": "icon",
      "value": "god power black hole icon"
    },
    {
      "tag": "usedicon",
      "value": "god power black hole icon done"
    }
  ]
} as const;
export default blackHolePowerXmb;
