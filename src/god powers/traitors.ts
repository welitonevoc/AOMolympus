// Auto-converted from traitors.xmb (Age of Mythology XMB God Power Definition)
export const traitorsPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Traitors",
    "techname": "traitors",
    "type": "traitors"
  },
  "children": [
    {
      "tag": "placement",
      "attributes": {
        "enemy": "",
        "forceonmap": "1",
        "matchtype": "LogicalTypeValidTraitorsTarget"
      },
      "value": "unit"
    },
    {
      "tag": "activetime",
      "value": "0.10"
    },
    {
      "tag": "damageonconvert",
      "value": "0.15 "
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "Caster",
        "type": "StartSound"
      },
      "value": "Traitor"
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
        "sendalertto": "all"
      },
      "value": "10.0"
    },
    {
      "tag": "traitorseffect",
      "value": "Traitors effect"
    },
    {
      "tag": "recharges",
      "value": "2"
    },
    {
      "tag": "rechargetime",
      "value": "180 "
    }
  ]
} as const;
export default traitorsPowerXmb;
