// Auto-converted from flaming weapons.xmb (Age of Mythology XMB God Power Definition)
export const flamingWeaponsPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "FlamingWeapons",
    "techname": "flaming weapons",
    "type": "flamingweapons"
  },
  "children": [
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "skip"
    },
    {
      "tag": "activetime",
      "value": "60"
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
      "value": "FlamingWeapons"
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
      "tag": "abstractattacktargettype",
      "value": "LogicalTypeValidFlamingWeaponsTarget"
    },
    {
      "tag": "powerplayerrelation",
      "value": "player"
    },
    {
      "tag": "playsbattlemusic"
    },
    {
      "tag": "tech",
      "value": "Flaming Weapons Active"
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Ulfsark"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Axe"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Raiding Cavalry"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Throwing Axeman"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Axe"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Huskarl"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Jarl"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Hero Norse"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Hero Ragnorok"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Portable Ram"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Portable Ram"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Hoplite"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Hypaspist"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Hippikon"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Prodromos"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Hero Greek Theseus"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Spearman"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Axeman"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Camelry"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "War Elephant"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Mercenary"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Mercenary Cavalry"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Arkantos"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Amanra"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Axe"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Ajax"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sword"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Reginleif"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Spear"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Arrow Flaming"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Arrow"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Sling Stone"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Sling Stone"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Axe"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Axe"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Petrobolos Shot"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Petrobolos Shot"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Catapult Shot"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Catapult Shot"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Ballista Shot"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Ballista Bolt"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Ramming Ship Greek"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Ram Ship"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Ramming Ship Norse"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Ram Ship"
        }
      ]
    },
    {
      "tag": "particlesfxnode",
      "children": [
        {
          "tag": "unittype",
          "value": "Ramming Ship Egyptian"
        },
        {
          "tag": "sfx",
          "value": "SFX A Flaming Ram Ship"
        }
      ]
    }
  ]
} as const;
export default flamingWeaponsPowerXmb;
