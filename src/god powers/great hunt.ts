// Auto-converted from great hunt.xmb (Age of Mythology XMB God Power Definition)
export const greatHuntPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "GreatHunt",
    "techname": "Great Hunt",
    "type": "clone"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "3.0"
    },
    {
      "tag": "radius",
      "value": "10.0"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "4",
        "radius": "9",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Norse SFX"
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
        "listenertype": "IfOnScreenAll",
        "type": "StartSound"
      },
      "value": "GreatHunt"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "full"
    },
    {
      "tag": "overallchance",
      "value": "1"
    },
    {
      "tag": "abstracttype",
      "value": "Herdable"
    },
    {
      "tag": "abstracttype",
      "value": "Huntable"
    },
    {
      "tag": "sfx",
      "value": "Clone SFX"
    },
    {
      "tag": "maxfood",
      "value": "600.0"
    },
    {
      "tag": "minimapeventtime",
      "attributes": {
        "sendalertto": "ally"
      },
      "value": "10.0"
    },
    {
      "tag": "icon",
      "value": "god power great hunt icon"
    },
    {
      "tag": "usedicon",
      "value": "god power great hunt icon done"
    }
  ]
} as const;
export default greatHuntPowerXmb;
