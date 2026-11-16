// Auto-converted from create gold.xmb (Age of Mythology XMB God Power Definition)
export const createGoldPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "DwarvenMine",
    "techname": "create gold",
    "type": "DwarvenMines"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "-1"
    },
    {
      "tag": "createunit",
      "attributes": {
        "delay": "0.0",
        "norotate": "",
        "quantity": "1",
        "radius": "0.0"
      },
      "value": "Gold Mine Dwarven"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1",
        "losprotounit": "Gold Mine Dwarven"
      },
      "value": "full"
    },
    {
      "tag": "placementprotounitid",
      "value": "Gold Mine Dwarven"
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
      "tag": "minimapeventtime",
      "attributes": {
        "sendalertto": "none"
      },
      "value": "0.0f"
    },
    {
      "tag": "ageinfo",
      "children": [
        {
          "tag": "age",
          "value": "Archaic Age"
        },
        {
          "tag": "resource",
          "attributes": {
            "amount": "750.0"
          },
          "value": "gold"
        }
      ]
    },
    {
      "tag": "ageinfo",
      "children": [
        {
          "tag": "age",
          "value": "Classical Age"
        },
        {
          "tag": "resource",
          "attributes": {
            "amount": "1500.0"
          },
          "value": "gold"
        }
      ]
    },
    {
      "tag": "ageinfo",
      "children": [
        {
          "tag": "age",
          "value": "Heroic Age"
        },
        {
          "tag": "resource",
          "attributes": {
            "amount": "3000.0"
          },
          "value": "gold"
        }
      ]
    },
    {
      "tag": "ageinfo",
      "children": [
        {
          "tag": "age",
          "value": "Mythic Age"
        },
        {
          "tag": "resource",
          "attributes": {
            "amount": "6000.0"
          },
          "value": "gold"
        }
      ]
    },
    {
      "tag": "icon",
      "value": "god power create gold icon"
    },
    {
      "tag": "usedicon",
      "value": "god power create gold icon done"
    }
  ]
} as const;
export default createGoldPowerXmb;
