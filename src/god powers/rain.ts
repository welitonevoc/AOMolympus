// Auto-converted from rain.xmb (Age of Mythology XMB God Power Definition)
export const rainPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Rain",
    "techname": "Rain",
    "type": "rain"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "60.0"
    },
    {
      "tag": "radius",
      "value": "12.0"
    },
    {
      "tag": "powerblocker",
      "value": "-1"
    },
    {
      "tag": "minimapeventtime",
      "attributes": {
        "sendalertto": "none"
      },
      "value": "0.0"
    },
    {
      "tag": "fasteststriketime",
      "value": "1.0"
    },
    {
      "tag": "sloweststriketime",
      "value": "2.0"
    },
    {
      "tag": "placement",
      "value": "skip"
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
      "value": "LightThunder"
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
      "tag": "sfx",
      "value": "Rain"
    },
    {
      "tag": "rainspotproto",
      "value": "AbstractSettlement"
    },
    {
      "tag": "smallsfx",
      "value": "Rain Small"
    },
    {
      "tag": "smallrainspotproto",
      "value": "AbstractFarm"
    },
    {
      "tag": "gatherrate",
      "attributes": {
        "rate": "1.85"
      },
      "value": "farm"
    },
    {
      "tag": "gatherrate",
      "attributes": {
        "rate": "2.0"
      },
      "value": "fish"
    },
    {
      "tag": "powerplayerrelation",
      "value": "any"
    },
    {
      "tag": "bonusmodifierally",
      "value": "1.5f"
    },
    {
      "tag": "icon",
      "value": "god power rain icon"
    },
    {
      "tag": "usedicon",
      "value": "god power rain icon done"
    }
  ]
} as const;
export default rainPowerXmb;
