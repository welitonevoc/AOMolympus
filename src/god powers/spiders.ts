// Auto-converted from spiders.xmb (Age of Mythology XMB God Power Definition)
export const spidersPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Spiders",
    "techname": "spiders",
    "type": "spiders"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "-1"
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
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "8",
        "radius": "10.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Atlantean SFX"
    },
    {
      "tag": "numbertocreate",
      "value": "4 "
    },
    {
      "tag": "hatchtime",
      "value": "5.0 "
    },
    {
      "tag": "hatchintervalmin",
      "value": "0.2 "
    },
    {
      "tag": "hatchintervalmax",
      "value": "0.7 "
    },
    {
      "tag": "hatchprobability",
      "value": "0.001 "
    },
    {
      "tag": "spiderproto",
      "value": "Spider"
    },
    {
      "tag": "spidereggproto",
      "value": "Spider Egg"
    },
    {
      "tag": "spiderdoorproto",
      "value": "Spider Door"
    },
    {
      "tag": "spiderwarnproto",
      "value": "Spider Warn"
    },
    {
      "tag": "initialdelay",
      "value": "0.5 "
    },
    {
      "tag": "warntime",
      "value": "1.0 "
    },
    {
      "tag": "abstractattacktargettype",
      "value": "LogicalTypeValidSpiderTarget"
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
        "listenertype": "IfOnScreenAlly",
        "type": "StartSound"
      },
      "value": "Spiders"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "Ally",
        "type": "EndSound"
      },
      "value": "GodPowerEnd"
    },
    {
      "tag": "humandeathsoundset",
      "value": "SpiderMaleDeath"
    },
    {
      "tag": "minimapeventtime",
      "attributes": {
        "sendalertto": "ally"
      },
      "value": "10.0"
    },
    {
      "tag": "messagealertplayerrelation",
      "value": "ally"
    },
    {
      "tag": "recharges",
      "value": "2"
    },
    {
      "tag": "rechargetime",
      "value": "180"
    }
  ]
} as const;
export default spidersPowerXmb;
