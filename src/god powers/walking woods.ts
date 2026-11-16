// Auto-converted from walking woods.xmb (Age of Mythology XMB God Power Definition)
export const walkingWoodsPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "WalkingWoods",
    "techname": "Walking Woods",
    "type": "swapunit"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "0.6"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "6",
        "radius": "6.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Norse SFX"
    },
    {
      "tag": "radius",
      "value": "6.0"
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
      "value": "WalkingWoodsBirth"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "IfOnScreenAll",
        "positional": "",
        "type": "StartSound"
      },
      "value": "WalkingWoods"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1",
        "matchtype": "Tree"
      },
      "value": "full"
    },
    {
      "tag": "powerplayerrelation",
      "value": "all"
    },
    {
      "tag": "overallchance",
      "value": "1"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Pine"
      },
      "value": "Pine"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Palm"
      },
      "value": "Palm"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Oak"
      },
      "value": "Oak Tree"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Oak"
      },
      "value": "Oak Autumn"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Pine Snow"
      },
      "value": "Pine Snow"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Pine"
      },
      "value": "Pine Dead"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Savannah"
      },
      "value": "Savannah Tree"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Marsh"
      },
      "value": "Marsh Tree"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Tundra"
      },
      "value": "Tundra Tree"
    },
    {
      "tag": "abstracttype",
      "attributes": {
        "swapto": "Walking Woods Oak"
      },
      "value": "Gaia Forest Tree"
    },
    {
      "tag": "swapdelay",
      "value": "0.5"
    },
    {
      "tag": "convertunitstogodpowerplayer"
    },
    {
      "tag": "convertusingminmax",
      "attributes": {
        "maxswapamount": "6",
        "minswapamount": "6"
      },
      "value": "Dummy"
    },
    {
      "tag": "icon",
      "value": "god power walking woods icon"
    },
    {
      "tag": "usedicon",
      "value": "god power walking woods icon done"
    }
  ]
} as const;
export default walkingWoodsPowerXmb;
