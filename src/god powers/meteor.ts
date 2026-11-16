// Auto-converted from meteor.xmb (Age of Mythology XMB God Power Definition)
export const meteorPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Meteor",
    "techname": "meteor",
    "type": "meteor"
  },
  "children": [
    {
      "tag": "builduptime",
      "value": "3.0"
    },
    {
      "tag": "activetime",
      "value": "15.0"
    },
    {
      "tag": "unitaitype",
      "value": "Meteor"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "10",
        "radius": "32.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Egypt SFX"
    },
    {
      "tag": "radius",
      "value": "32.0"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "full"
    },
    {
      "tag": "meteor",
      "value": "meteor"
    },
    {
      "tag": "splashsfx",
      "value": "Meteor Impact Water"
    },
    {
      "tag": "landsfx",
      "value": "Meteor Impact Ground"
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
      "tag": "firststrikesoundset",
      "value": "MeteorBigHit"
    },
    {
      "tag": "strikesoundset",
      "value": "MeteorSmallHit"
    },
    {
      "tag": "firstapproachsound",
      "value": "MeteorApproach"
    },
    {
      "tag": "approachsound",
      "value": "MeteorWhoosh"
    },
    {
      "tag": "fasteststriketime",
      "value": "0.50"
    },
    {
      "tag": "sloweststriketime",
      "value": "2.0"
    },
    {
      "tag": "playsbattlemusic"
    },
    {
      "tag": "abstractattacktargettype",
      "value": "LogicalTypeValidMeteorTarget"
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
          "value": "0.25"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.25"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.75"
        },
        {
          "tag": "minhpdamageunit",
          "value": "1200"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "450"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "5000"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "4800"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "1000"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "9000"
        }
      ]
    },
    {
      "tag": "gpdamagemodel",
      "children": [
        {
          "tag": "playerrelation",
          "value": "ally"
        },
        {
          "tag": "basedamagepercentunit",
          "value": "0.25"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.25"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.25"
        },
        {
          "tag": "minhpdamageunit",
          "value": "300"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "300"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "600"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "600"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "600"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "1200"
        }
      ]
    },
    {
      "tag": "accuracy",
      "value": "0.85"
    },
    {
      "tag": "unitthrowchance",
      "value": "0.85"
    },
    {
      "tag": "minthrowdistance",
      "value": "6.0"
    },
    {
      "tag": "maxthrowdistance",
      "value": "10.0"
    },
    {
      "tag": "minthrowheight",
      "value": "1.0"
    },
    {
      "tag": "maxthrowheight",
      "value": "2.0"
    },
    {
      "tag": "minthrowvelocity",
      "value": "10.0"
    },
    {
      "tag": "maxthrowvelocity",
      "value": "20.0"
    },
    {
      "tag": "camerashake",
      "attributes": {
        "duration": "0.50",
        "strength": "0.25"
      }
    },
    {
      "tag": "powerblocker",
      "value": "30.0f"
    },
    {
      "tag": "icon",
      "value": "god power meteor icon"
    },
    {
      "tag": "usedicon",
      "value": "god power meteor icon done"
    }
  ]
} as const;
export default meteorPowerXmb;
