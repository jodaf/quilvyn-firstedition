/*
Copyright 2015, James J. Hayes

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place, Suite 330, Boston, MA 02111-1307 USA.
*/

"use strict";

var FirstEdition_VERSION = '0.1alpha';

/*
 */
function FirstEdition() {

  if(window.SRD35 == null) {
    alert('The FirstEdition module requires use of the SRD35 module');
    return;
  }

  var rules = new ScribeRules('First Edition', FirstEdition_VERSION);
  SRD35.createViewers(rules, SRD35.VIEWERS);
  rules.editorElements = SRD35.initialEditorElements();
  // Remove some editor and character sheet elements that don't apply
  rules.defineEditorElement('skills');
  rules.defineEditorElement('feats');
  rules.defineEditorElement('specialize');
  rules.defineEditorElement('prohibit');

  FirstEdition.abilityRules(rules);
  FirstEdition.raceRules(rules, FirstEdition.LANGUAGES, FirstEdition.RACES);
  FirstEdition.classRules(rules, FirstEdition.CLASSES);
  FirstEdition.descriptionRules(rules, SRD35.ALIGNMENTS, SRD35.GENDERS);
  FirstEdition.equipmentRules
    (rules, FirstEdition.ARMORS, FirstEdition.GOODIES, FirstEdition.SHIELDS,
     FirstEdition.WEAPONS);
  FirstEdition.combatRules(rules);
  FirstEdition.movementRules(rules);
  FirstEdition.magicRules(rules, FirstEdition.CLASSES, SRD35.SCHOOLS);
  rules.defineChoice('preset', 'race', 'level', 'levels');
  rules.defineChoice('random', FirstEdition.RANDOMIZABLE_ATTRIBUTES);
  rules.randomizeOneAttribute = SRD35.randomizeOneAttribute;
  rules.makeValid = SRD35.makeValid;
  rules.ruleNotes = FirstEdition.ruleNotes;
  Scribe.addRuleSet(rules);
  FirstEdition.rules = rules;

}

FirstEdition.ARMORS = [
  'None', 'Banded', 'Chain', 'Elfin Chain', 'Leather', 'Padded', 'Plate',
  'Ring', 'Scale', 'Splint', 'Studded'
];
FirstEdition.CLASSES = [
  'Assassin', 'Cleric', 'Druid', 'Fighter', 'Illusionist', 'Magic User',
  'Paladin', 'Ranger', 'Thief'
];
FirstEdition.GOODIES = [
  'Ring Of Protection +1',
  'Ring Of Protection +2',
  'Ring Of Protection +3',
  'Ring Of Protection +4'
];
FirstEdition.LANGUAGES = [
  'Common', 'Druids\' Cant', 'Dwarfish', 'Elven', 'Gnoll', 'Gnomish', 'Goblin',
  'Halfling', 'Hobgoblin', 'Kobold', 'Orcish'
];
FirstEdition.RACES =
  ['Dwarf', 'Elf', 'Gnome', 'Half Elf', 'Half Orc', 'Halfling', 'Human'];
// Note: the order here handles dependencies among attributes when generating
// random characters
FirstEdition.RANDOMIZABLE_ATTRIBUTES = [
  'charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom',
  'extraStrength', 'name', 'race', 'gender', 'alignment', 'levels',
  'languages', 'hitPoints', 'armor', 'shield',
  'weapons', 'spells', 'goodies'
];
FirstEdition.SHIELDS = [
  'Large Shield', 'Medium Shield', 'None', 'Small Shield'
];
FirstEdition.WEAPONS = [
  'Bastard Sword:2d4', 'Battle Axe:d8', 'Broad Sword:2d4', 'Club:d4',
  'Composite Long Bow:d6r60', 'Composite Short Bow:d6r50', 'Dagger:d4',
  'Dart:d3r15', 'Halbert:d10', 'Hand Axe:d6', 'Heavy Crossbow:d6+1r60',
  'Heavy Flail:d6+1', 'Heavy Mace:d6+1', 'Heavy Pick:d6+1',
  'Heavy War Hammer:d6+1', 'Javelin:d6r20', 'Lance:2d4+1',
  'Light Crossbow:d4+1r60', 'Light Flail:d4+1', 'Light Mace:d4+1',
  'Light Pick:d4+1', 'Light War Hammer:d4+1', 'Long Bow:d6r70',
  'Long Sword:d8', 'Morning Star:2d4', 'Pole Arm:d6',
  'Scimitar Sword:d8', 'Short Bow:d6r50', 'Short Sword:d6',
  'Sling:d4r35', 'Spear:d6r15', 'Staff:d6', 'Trident:d6+1',
  'Two-Handed Sword:d10', 'War Hammer:d4+1'
];

// Related information used internally by FirstEdition
FirstEdition.armorsArmorClassBonuses = {
  'None' : null, 'Banded' : -6, 'Chain' : -5, 'Elfin Chain' : -5,
  'Leather' : -2, 'Padded' :-2, 'Plate' : -7, 'Ring' : -3, 'Scale' : -4,
  'Splint' : -6, 'Studded' : -3
};
FirstEdition.thiefSkillsRacialAdjustments = {}; // Filled by raceRules
FirstEdition.spellsSchools = {
  'Aerial Servant':'Conjuration', 'Affect Normal Fires':'Transmutation',
  'Airy Water':'Transmutation', 'Alter Reality':'Illusion',
  'Animal Friendship':'Enchantment', 'Animal Growth':'Transmutation',
  'Animal Summoning I':'Conjuration', 'Animal Summoning II':'Conjuration',
  'Animal Summoning III':'Conjuration', 'Animate Dead':'Necromancy',
  'Animate Object':'Transmutation', 'Animate Rock':'Transmutation',
  'Anti-Animal Shell':'Abjuration', 'Anti-Magic Shell':'Abjuration',
  'Anti-Plant Shell':'Abjuration', 'Antipathy/Sympathy':'Enchantment',
  'Arcane Spells Level 1':'Universal', 'Astral Spell':'Transmutation',
  'Atonement':'Abjuration', 'Audible Glamer':'Illusion',
  'Augury':'Divination', 'Barkskin':'Transmutation',
  'Blade Barrier':'Evocation', 'Bless':'Conjuration', 'Blindness':'Illusion',
  'Blink':'Transmutation', 'Blur':'Illusion', 'Burning Hands':'Transmutation',
  'Cacodemon':'Conjuration', 'Call Lightning':'Transmutation',
  'Call Woodland Beings':'Conjuration', 'Change Self':'Illusion',
  'Chant':'Conjuration', 'Chaos':'Enchantment', 'Chariot Of Fire':'Evocation',
  'Charm Monster':'Enchantment', 'Charm Person Or Mammal':'Enchantment',
  'Charm Person':'Enchantment', 'Charm Plants':'Enchantment',
  'Clairaudience':'Divination', 'Clairvoyance':'Divination',
  'Clenched Fist':'Evocation', 'Clone':'Necromancy', 'Cloudkill':'Evocation',
  'Color Spray':'Transmutation', 'Command':'Enchantment',
  'Commune With Nature':'Divination', 'Commune':'Divination',
  'Comprehend Languages':'Transmutation', 'Cone Of Cold':'Evocation',
  'Confusion':'Enchantment', 'Conjure Animals':'Conjuration',
  'Conjure Earth Elemental':'Conjuration', 'Conjure Elemental':'Conjuration',
  'Conjure Fire Elemental':'Conjuration', 'Contact Other Plane':'Divination',
  'Continual Darkness':'Transmutation', 'Continual Light':'Transmutation',
  'Control Temperature 10\' Radius':'Transmutation',
  'Control Weather':'Transmutation', 'Control Winds':'Transmutation',
  'Create Food And Water':'Transmutation', 'Create Water':'Transmutation',
  'Creeping Doom':'Conjuration', 'Crushing Hand':'Evocation',
  'Cure Blindness':'Abjuration', 'Cure Critical Wounds':'Necromancy',
  'Cure Disease':'Necromancy', 'Cure Light Wounds':'Necromancy',
  'Cure Serious Wounds':'Necromancy', 'Dancing Lights':'Transmutation',
  'Darkness':'Transmutation', 'Deafness':'Illusion',
  'Death Spell':'Necromancy', 'Delayed Blast Fireball':'Evocation',
  'Demi-Shadow Magic':'Illusion', 'Demi-Shadow Monsters':'Illusion',
  'Detect Charm':'Divination', 'Detect Evil':'Divination',
  'Detect Illusion':'Divination', 'Detect Invisibility':'Divination',
  'Detect Lie':'Divination', 'Detect Magic':'Divination',
  'Detect Pits And Snares':'Divination', 'Dig':'Evocation',
  'Dimension Door':'Transmutation', 'Disintegrate':'Transmutation',
  'Dispel Exhaustion':'Illusion', 'Dispel Evil':'Abjuration',
  'Dispel Illusion':'Abjuration', 'Dispel Magic':'Abjuration',
  'Distance Distortion':'Transmutation', 'Divination':'Divination',
  'Duo-Dimension':'Transmutation', 'ESP':'Divination',
  'Earthquake':'Transmutation', 'Emotion':'Enchantment',
  'Enchant An Item':'Conjuration', 'Enchanted Weapon':'Transmutation',
  'Enlarge':'Transmutation', 'Entangle':'Transmutation',
  'Erase':'Transmutation', 'Exorcise':'Abjuration',
  'Explosive Runes':'Transmutation', 'Extension I':'Transmutation',
  'Extension II':'Transmutation', 'Extension III':'Transmutation',
  'Faerie Fire':'Transmutation', 'False Trap':'Illusion', 'Fear':'Illusion',
  'Feather Fall':'Transmutation', 'Feeblemind':'Enchantment',
  'Feign Death':'Necromancy', 'Find Familiar':'Conjuration',
  'Find The Path':'Divination', 'Find Traps':'Divination',
  'Finger Of Death':'Enchantment', 'Fire Charm':'Enchantment',
  'Fire Seeds':'Conjuration', 'Fire Shield':'Evocation',
  'Fire Storm':'Evocation', 'Fire Trap':'Evocation', 'Fireball':'Evocation',
  'Flame Arrow':'Evocation', 'Flame Strike':'Evocation',
  'Floating Disk':'Evocation', 'Fly':'Transmutation',
  'Fog Cloud':'Transmutation', 'Fool\'s Gold':'Transmutation',
  'Forceful Hand':'Evocation', 'Forget':'Enchantment',
  'Freezing Sphere':'Transmutation', 'Friends':'Enchantment',
  'Fumble':'Enchantment', 'Gate':'Conjuration',
  'Gaze Reflection':'Transmutation', 'Geas':'Enchantment',
  'Glass-Steel':'Transmutation', 'Glasseye':'Transmutation',
  'Globe Of Invulnerability':'Abjuration', 'Glyph Of Warding':'Abjuration',
  'Grasping Hand':'Evocation', 'Guards And Wards':'Abjuration',
  'Gust Of Wind':'Transmutation', 'Hallucinatory Forest':'Illusion',
  'Hallucinatory Terrain':'Illusion', 'Haste':'Transmutation',
  'Heal':'Necromancy', 'Heat Metal':'Necromancy', 'Hold Animal':'Enchantment',
  'Hold Monster':'Enchantment', 'Hold Person':'Enchantment',
  'Hold Plant':'Enchantment', 'Hold Portal':'Transmutation',
  'Holy Word':'Conjuration', 'Hypnotic Pattern':'Illusion',
  'Hypnotism':'Enchantment', 'Ice Storm':'Evocation', 'Identify':'Divination',
  'Illusory Script':'Illusion', 'Imprisonment':'Abjuration',
  'Improved Invisibility':'Illusion', 'Improved Phantasmal Force':'Illusion',
  'Incendiary Cloud':'Evocation', 'Infravision':'Transmutation',
  'Insect Plague':'Conjuration', 'Instant Summons':'Conjuration',
  'Interposing Hand':'Evocation', 'Invisibility 10\' Radius':'Illusion',
  'Invisibility To Animals':'Transmutation', 'Invisibility':'Illusion',
  'Invisible Stalker':'Conjuration', 'Irresistible Dance':'Enchantment',
  'Jump':'Transmutation', 'Knock':'Transmutation',
  'Know Alignment':'Divination', 'Legend Lore':'Divination',
  'Levitate':'Transmutation', 'Light':'Transmutation',
  'Lightning Bolt':'Evocation', 'Limited Wish':'Conjuration',
  'Locate Animals':'Divination', 'Locate Object':'Divination',
  'Locate Plants':'Divination', 'Lower Water':'Transmutation',
  'Mage\'s Faithful Hound':'Conjuration', 'Mage\'s Sword':'Evocation',
  'Magic Aura':'Illusion', 'Magic Jar':'Necromancy',
  'Magic Missle':'Evocation', 'Magic Mouth':'Transmutation',
  'Major Creation':'Transmutation', 'Mass Charm':'Enchantment',
  'Mass Invisibility':'Illusion', 'Mass Suggestion':'Enchantment',
  'Massmorph':'Illusion', 'Maze':'Conjuration', 'Mending':'Transmutation',
  'Message':'Transmutation', 'Meteor Swarm':'Evocation',
  'Mind Blank':'Abjuration', 'Minor Creation':'Transmutation',
  'Minor Globe Of Invulnerability':'Abjuration', 'Mirror Image':'Illusion',
  'Misdirection':'Illusion', 'Mnemonic Enhancement':'Transmutation',
  'Monster Summoning I':'Conjuration', 'Monster Summoning II':'Conjuration',
  'Monster Summoning III':'Conjuration', 'Monster Summoning IV':'Conjuration',
  'Monster Summoning V':'Conjuration', 'Monster Summoning VI':'Conjuration',
  'Monster Summoning VII':'Conjuration', 'Move Earth':'Transmutation',
  'Neutralize Poison':'Transmutation', 'Non-Detection':'Abjuration',
  'Obscurement':'Transmutation', 'Paralyzation':'Illusion',
  'Part Water':'Transmutation', 'Pass Plant':'Transmutation',
  'Pass Without Trace':'Enchantment', 'Passwall':'Transmutation',
  'Permanency':'Transmutation', 'Permanent Illusion':'Illusion',
  'Phantasmal Force':'Illusion', 'Phantasmal Killer':'Illusion',
  'Phase Door':'Transmutation', 'Plane Shift':'Transmutation',
  'Plant Door':'Transmutation', 'Plant Growth':'Transmutation',
  'Polymorph Object':'Transmutation', 'Polymorph Other':'Transmutation',
  'Polymorph Self':'Transmutation', 'Power Word Blind':'Conjuration',
  'Power Word Kill':'Conjuration', 'Power Word Stun':'Conjuration',
  'Prayer':'Conjuration', 'Predict Weather':'Divination',
  'Prismatic Sphere':'Conjuration', 'Prismatic Spray':'Abjuration',
  'Prismatic Wall':'Abjuration', 'Produce Fire':'Transmutation',
  'Produce Flame':'Transmutation', 'Programmed Illusion':'Illusion',
  'Project Image':'Illusion', 'Protection From Evil 10\' Radius':'Abjuration',
  'Protection From Evil':'Abjuration', 'Protection From Fire':'Abjuration',
  'Protection From Lightning':'Abjuration',
  'Protection From Normal Missles':'Abjuration',
  'Purify Food And Drink':'Transmutation', 'Purify Water':'Transmutation',
  'Push':'Conjuration', 'Pyrotechnics':'Transmutation', 'Quest':'Enchantment',
  'Raise Dead':'Necromancy', 'Ray Of Enfeeblement':'Enchantment',
  'Read Magic':'Divination', 'Regenerate':'Necromancy',
  'Reincarnate':'Necromancy', 'Remove Curse':'Abjuration',
  'Remove Fear':'Abjuration', 'Repel Insects':'Abjuration',
  'Repulsion':'Abjuration', 'Resist Cold':'Transmutation',
  'Resist Fire':'Transmutation', 'Restoration':'Necromancy',
  'Resurrection':'Necromancy', 'Reverse Gravity':'Transmutation',
  'Rope Trick':'Transmutation', 'Sanctuary':'Abjuration', 'Scare':'Enchantment',
  'Secret Chest':'Transmutation', 'Shades':'Illusion', 'Shadow Door':'Illusion',
  'Shadow Magic':'Illusion', 'Shadow Monsters':'Illusion',
  'Shape Change':'Transmutation', 'Shatter':'Transmutation',
  'Shield':'Evocation', 'Shillelagh':'Transmutation',
  'Shocking Grasp':'Transmutation', 'Silence 15\' Radius':'Transmutation',
  'Simulacrum':'Illusion', 'Sleep':'Enchantment', 'Slow Poison':'Necromancy',
  'Slow':'Transmutation', 'Snake Charm':'Enchantment', 'Snare':'Enchantment',
  'Speak With Animals':'Transmutation', 'Speak With Dead':'Necromancy',
  'Speak With Monsters':'Transmutation', 'Speak With Plants':'Transmutation',
  'Spectral Force':'Illusion', 'Spell Immunity':'Abjuration',
  'Spider Climb':'Transmutation', 'Spirit-Rack':'Abjuration',
  'Spiritual Weapon':'Evocation', 'Statue':'Transmutation',
  'Sticks To Snakes':'Transmutation', 'Stinking Cloud':'Evocation',
  'Stone Shape':'Transmutation', 'Stone Tell':'Divination',
  'Stone To Flesh':'Transmutation', 'Strength':'Transmutation',
  'Suggestion':'Enchantment', 'Summon Insects':'Conjuration',
  'Summon Shadow':'Conjuration', 'Symbol':'Conjuration',
  'Telekinesis':'Transmutation', 'Teleport':'Transmutation',
  'Temporal Statis':'Transmutation', 'Time Stop':'Transmutation',
  'Tiny Hut':'Transmutation', 'Tongues':'Transmutation',
  'Transformation':'Transmutation', 'Transmute Metal To Wood':'Transmutation',
  'Transmute Rock To Mud':'Transmutation',
  'Transport Via Plants':'Transmutation', 'Trap The Soul':'Conjuration',
  'Tree':'Transmutation', 'Trip':'Enchantment',
  'True Seeing':'Divination', 'True Sight':'Divination',
  'Turn Wood':'Transmutation', 'Unseen Servant':'Conjuration',
  'Vanish':'Transmutation', 'Veil':'Illusion',
  'Ventriloquism':'Illusion', 'Vision':'Divination', 'Wall Of Fire':'Evocation',
  'Wall Of Fog':'Transmutation', 'Wall Of Force':'Evocation',
  'Wall Of Ice':'Evocation', 'Wall Of Iron':'Evocation',
  'Wall Of Stone':'Evocation', 'Wall Of Thorns':'Conjuration',
  'Warp Wood':'Transmutation', 'Water Breathing':'Transmutation',
  'Weather Summoning':'Conjuration', 'Web':'Evocation',
  'Wind Walk':'Transmutation', 'Wish':'Conjuration',
  'Wizard Eye':'Transmutation', 'Wizard Lock':'Transmutation',
  'Word Of Recall':'Transmutation', 'Write':'Evocation'
};
FirstEdition.strengthDamageAdjustments = [
  -1, -1, null, null, null, null, null, 1, 1, 2, 3, 3, 4, 5, 6
];
FirstEdition.strengthEncumbranceAdjustments = [
  -35, -25, -15, null, null, 10, 20, 35, 50, 75, 100, 125, 150, 200, 300
];
FirstEdition.strengthMajorTestPercentages = [
  0, 0, 0, 1, 2, 4, 7, 10, 13, 16, 20, 25, 30, 35, 40
];

/* Defines the rules related to character abilities. */
FirstEdition.abilityRules = function(rules) {

  // Charisma
  rules.defineRule('abilityNotes.charismaLoyaltyAjustment',
    'charisma', '=',
    'source <= 8 ? source * 5 - 45 : source <= 13 ? null : ' +
    'source <= 15 ? source * 5 - 65 : (source * 10 - 140)'
  );
  rules.defineRule('maximumHenchmen',
    'charisma', '=',
    'source<=10 ? Math.floor((source-1)/2) : source<=12 ? (source-7) : ' +
    'source<=16 ? (source-8) : ((source-15)* 5)'
  );
  rules.defineRule('abilityNotes.charismaReactionAdjustment',
    'charisma', '=',
    'source <= 7 ? (source * 5 - 40) : source <= 12 ? null : ' +
    'source <= 15 ? source * 5 - 60 : (source * 5 - 55)'
  );

  // Constitution
  rules.defineRule('surviveResurrection',
    'constitution', '=',
    'source <= 13 ? source * 5 + 25 : source <= 18 ? source * 2 + 64 : 100'
  );
  rules.defineRule('surviveSystemShock',
    'constitution', '=',
    'source <= 13 ? source * 5 + 20 : source == 16 ? 95 : ' +
    'source <= 17 ? source * 3 + 46 : 99'
  );
  rules.defineRule('combatNotes.constitutionHitPointsAdjustment',
    'constitution', '=',
    'source <= 3 ? -2 : source <= 6 ? -1 : source <= 14 ? null : (source - 14)',
    'warriorLevel', 'v', 'source == 0 ? 2 : null',
    'level', '*', null
  );
  rules.defineRule
    ('hitPoints', 'combatNotes.constitutionHitPointsAdjustment', '+', null);
  rules.defineSheetElement
    ('Survive Resurrection', 'SaveAndResistance/', '<b>%N</b>: %V%');
  rules.defineSheetElement
    ('Survive System Shock', 'SaveAndResistance/', '<b>%N</b>: %V%');

  // Dexterity
  rules.defineRule
    ('armorClass', 'combatNotes.dexterityArmorClassAdjustment', '+', null);
  rules.defineRule('combatNotes.dexterityArmorClassAdjustment',
    'dexterity', '=',
    'source <= 6 ? (7 - source) : source <= 14 ? null : ' +
    'source <= 18 ? 14 - source : -4'
  );
  rules.defineRule('combatNotes.dexterityMissleAttackAdjustment',
    'dexterity', '=',
    'source <= 5 ? (source - 6) : source <= 15 ? null : ' +
    'source <= 18 ? source - 15 : 3'
  );
  rules.defineRule('combatNotes.dexteritySurpriseAdjustment',
    'dexterity', '=',
    'source <= 5 ? (source - 6) : source <= 15 ? null : ' +
    'source <= 18 ? source - 15 : 3'
  );

  // Intelligence
  rules.defineRule('languageBonus',
    'intelligence', '+',
    'source<=7 ? null : source<=15 ? Math.floor((source-6) / 2) : (source-11)'
  );
  rules.defineRule('languageCount', 'languageBonus', '+', null);

  // Strength
  rules.defineRule('abilityNotes.strengthEncumbranceAdjustment',
    'strengthRow', '=', 'FirstEdition.strengthEncumbranceAdjustments[source]'
  );
  rules.defineRule('combatNotes.strengthAttackAdjustment',
    'strengthRow', '=', 'source <= 2 ? (source - 3) : ' +
                        'source <= 7 ? null : Math.floor((source - 5) / 3)'
  );
  rules.defineRule('combatNotes.strengthDamageAdjustment',
    'strengthRow', '=', 'FirstEdition.strengthDamageAdjustments[source]'
  );
  rules.defineRule('strengthMajorTest',
    'strengthRow', '=', 'FirstEdition.strengthMajorTestPercentages[source]'
  );
  rules.defineRule('strengthMinorTest',
    'strengthRow', '=', 'source == 14 ? 5 : Math.floor((source + 5) / 4)'
  );
  rules.defineRule('strengthRow',
    'strength', '=', 'source >= 16 ? source - 9 : Math.floor((source - 2) / 2)',
    'extraStrength', '+', 'source <= 50 ? 1 : source <= 75 ? 2 : ' +
                          'source <= 90 ? 3 : source <= 99 ? 4 : 5'
  );
  rules.defineEditorElement
    ('extraStrength', 'Extra Strength', 'text', [4], 'intelligence');
  rules.defineSheetElement('Extra Strength', 'Strength+', '/%V');
  rules.defineSheetElement('StrengthTests', 'LoadInfo', '%V', '');
  rules.defineSheetElement
    ('Strength Minor Test', 'StrengthTests/',
     '<b>Strength Minor/Major Test</b>: %Vin6');
  rules.defineSheetElement('Strength Major Test', 'StrengthTests/', '/%V%');

  // Wisdom
  rules.defineRule('saveNotes.wisdomMentalSavingThrowAdjustment',
    'wisdom', '=',
    'source<=5 ? (source-6) : source<=7 ? -1 : source<=14 ? null : (source-14)'
  );

};

/* Defines the rules related to character classes. */
FirstEdition.classRules = function(rules, classes) {

  rules.defineNote
    ('validationNotes.levelsTotal:' +
     'Allocated levels differ from level total by %V');
  rules.defineRule('validationNotes.levelsTotal',
    'level', '+=', '-source',
    /^levels\./, '+=', null
  );

  rules.defineRule('warriorLevel', '', '=', '0');

  for(var i = 0; i < classes.length; i++) {

    var baseAttack, features, hitDie, notes, saveAimed, saveBreath, saveDeath,
        savePetrification, saveSpell, spellsKnown, thiefAbilityLevel;
    var klass = classes[i];

    spellsKnown = null;
    thiefAbilityLevel = null;
    //TODO armor/shield/weapon proficiency
    //TODO level experience points

    if(klass == 'Assassin') {
      baseAttack = 'source <= 4 ? -1 : source <= 8 ? 1 : source <= 12 ? 4 : 6';
      features = [
        'Assassination', 'Backstab', 'Disguise', '9:Extra Languages',
        '12:Read Scrolls'
      ];
      hitDie = 6;
      notes = [
        'combatNotes.assassinationFeature:' +
          '%V% - 5%/2 foe levels chance of killing surprised foe',
        'combatNotes.backstabFeature:' +
          '+4 melee attack/x%V damage when unobserved',
        'featureNotes.disguiseFeature:92+% chance of successful disguise',
        'featureNotes.extraLanguagesFeature:+%V languages of any type',
        'magicNotes.readScrollsFeature:Cast arcane spells from scrolls',
        'validationNotes.assassinClassAlignment:Requires Alignment =~ Evil',
        'validationNotes.assassinClassConstitution:Requires Constitution >= 6',
        'validationNotes.assassinClassDexterity:Requires Dexterity >= 12',
        'validationNotes.assassinClassIntelligence:Requires Intelligence >= 11',
        'validationNotes.assassinClassStrength:Requires Strength >= 12',
        'validationNotes.assassinClassWisdom:Requires Wisdom >= 6'
      ];
      saveAimed = '14 - Math.floor(source / 4) * 2'
      saveBreath = '16 - Math.floor(source / 4)'
      saveDeath = '13 - Math.floor(source / 4)'
      savePetrification = '12 - Math.floor(source / 4)'
      saveSpell = '15 - Math.floor(source / 4) * 2'
      thiefAbilityLevel = 'source >= 4 ? source - 2 : 1';
      rules.defineRule('combatNotes.assassinationFeature',
        'levels.Assassin', '=', '50 + 5 * source'
      );
      rules.defineRule('combatNotes.backstabFeature',
        'levels.Assassin', '+=', '2 + Math.floor((source - 1) / 4)'
      );
      rules.defineRule('featureNotes.extraLanguagesFeature',
        'intelligence', '=', 'source < 15 ? null : (source - 15)'
      );
      rules.defineRule
        ('languageCount', 'featureNotes.extraLanguagesFeature', '+=', null);

    } else if(klass == 'Cleric') {
      baseAttack = 'source < 19 ? Math.floor(source / 3) * 2 : 21';
      features = ['Turn Undead', '9:Attract Followers'];
      hitDie = 8;
      notes = [
        'combatNotes.turnUndeadFeature:' +
          'Turn 2d6/destroy(good) or control (evil) d6+6 undead creatures',
        'featureNotes.attractFollowersFeature:' +
          'May build stronghold and attract followers',
        'featureNotes.bonusClericExperience:Bonus to awarded experience',
        'magicNotes.clericSpellFailure:%V%',
        'validationNotes.clericClassCharisma:Requires Charisma >= 6',
        'validationNotes.clericClassConstitution:Requires Constitution >= 6',
        'validationNotes.clericClassIntelligence:Requires Intelligence >= 6',
        'validationNotes.clericClassStrength:Requires Strength >= 6',
        'validationNotes.clericClassWisdom:Requires Wisdom >= 9'
      ];
      saveAimed = '14 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      saveBreath = '16 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      saveDeath = '10 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      savePetrification =
        '13 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      saveSpell = '15 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      spellsKnown = [
        'C1:1:1/2:2/4:3/9:4/11:5/12:6/15:7/17:8/19:9',
        'C2:3:1/4:2/5:3/9:4/12:5/13:6/15:7/17:8/19:9',
        'C3:5:1/6:2/8:3/11:4/12:5/13:6/15:7/17:8/19:9',
        'C4:7:1/8:2/10:3/13:4/14:5/16:6/18:7/20:8/21:9',
        'C5:9:1/10:2/14:3/15:4/16:5/18:6/20:7/21:8/22:9',
        'C6:11:1/12:2/16:3/18:4/20:5/21:6/23:7/24:8',
        'C7:16:1/19:2/22:3'
      ];
      rules.defineRule('casterLevelDivine', 'levels.Cleric', '+=', null);
      rules.defineRule('featureNotes.bonusClericExperience',
        'levels.Cleric', '=', '1',
        'wisdom', '?', 'source >= 16'
      );
      rules.defineRule('magicNotes.clericSpellFailure',
        'levels.Cleric', '?', null,
        'wisdom', '=', 'source<=11 ? (12 - source) * 5 : source==12 ? 1 : null'
      );
      rules.defineRule('turningLevel', 'levels.Cleric', '+=', null);
      rules.defineRule('spellBonus.C1',
        'levels.Cleric', '?', null,
        'wisdom', '=', 'source<=12 ? null : source==12 ? 1 : source<=18 ? 2 : 3'
      );
      rules.defineRule('spellBonus.C2',
        'levels.Cleric', '?', null,
        'wisdom', '=', 'source <= 14 ? null : source == 15 ? 1 : 2'
      );
      rules.defineRule('spellBonus.C3',
        'levels.Cleric', '?', null,
        'wisdom', '=', 'source <= 16 ? null : 1'
      );
      rules.defineRule('spellBonus.C4',
        'levels.Cleric', '?', null,
        'wisdom', '=', 'source <= 17 ? null : 1'
      );
      rules.defineRule('spellsKnown.C1', 'spellBonus.C1', '+', null);
      rules.defineRule('spellsKnown.C2', 'spellBonus.C2', '+', null);
      rules.defineRule('spellsKnown.C3', 'spellBonus.C3', '+', null);
      rules.defineRule('spellsKnown.C4', 'spellBonus.C4', '+', null);

    } else if(klass == 'Druid') {
      baseAttack = '2 * Math.floor(source / 3)';
      features = [
        'Resist Fire', 'Resist Lightning', '3:Druid\'s Knowledge',
        '3:Wilderness Movement', '7:Fey Immunity', '7:Shapeshift'
      ];
      hitDie = 8;
      notes = [
        'featureNotes.bonusDruidExperience:Bonus to awarded experience',
        'featureNotes.druid\'sKnowledgeFeature:' +
          'Identify plant/animal types/water purity',
        'featureNotes.wildernessMovementFeature:' +
          'Normal, untrackable movement through undergrowth',
        'magicNotes.shapeshiftFeature:Change into natural animal 3/day',
        'saveNotes.feyImmunityFeature:Immune to fey enchantment',
        'saveNotes.resistFireFeature:+2 vs. fire',
        'saveNotes.resistLightningFeature:+2 vs. lightning',
        'validationNotes.druidClassAlignment:Requires Alignment == Neutral',
        'validationNotes.druidClassCharisma:Requires Charisma >= 15',
        'validationNotes.druidClassConstitution:Requires Constitution >= 6',
        'validationNotes.druidClassDexterity:Requires Dexterity >= 6',
        'validationNotes.druidClassIntelligence:Requires Intelligence >= 6',
        'validationNotes.druidClassStrength:Requires Strength >= 6',
        'validationNotes.druidClassWisdom:Requires Wisdom >= 12'
      ];
      saveAimed = '14 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      saveBreath = '16 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      saveDeath = '10 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      savePetrification =
        '13 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      saveSpell = '15 - Math.floor(source / 3) - Math.floor((source+5) / 12)';
      spellsKnown = [
        'D1:1:2/3:3/4:4/9:5/13:6',
        'D2:2:1/3:2/5:3/7:4/11:5/14:6',
        'D3:3:1/4:2/7:3/12:4/13:5/14:6',
        'D4:6:1/8:2/10:3/12:4/13:5/14:6',
        'D5:9:1/10:2/12:3/13:4/14:5',
        'D6:11:1/12:2/13:3/14:4',
        'D7:12:1/13:2/14:3'
      ];
      rules.defineRule('casterLevelDivine', 'levels.Druid', '+=', null);
      rules.defineRule('featureNotes.bonusDruidExperience',
        'levels.Druid', '=', '1',
        'charisma', '?', 'source >= 16',
        'wisdom', '?', 'source >= 16'
      );
      rules.defineRule('languageCount', 'levels.Druid', '+=', '1');
      rules.defineRule('languages.Druids\' Cant', 'levels.Druid', '=', '1');
      rules.defineRule('spellBonus.D1',
        'levels.Druid', '?', null,
        'wisdom', '=', 'source<=12 ? null : source==12 ? 1 : source<=18 ? 2 : 3'
      );
      rules.defineRule('spellBonus.D2',
        'levels.Druid', '?', null,
        'wisdom', '=', 'source <= 14 ? null : source == 15 ? 1 : 2'
      );
      rules.defineRule('spellBonus.D3',
        'levels.Druid', '?', null,
        'wisdom', '=', 'source <= 16 ? null : 1'
      );
      rules.defineRule('spellBonus.D4',
        'levels.Druid', '?', null,
        'wisdom', '=', 'source <= 17 ? null : 1'
      );
      rules.defineRule('spellsKnown.D1', 'spellBonus.D1', '+', null);
      rules.defineRule('spellsKnown.D2', 'spellBonus.D2', '+', null);
      rules.defineRule('spellsKnown.D3', 'spellBonus.D3', '+', null);
      rules.defineRule('spellsKnown.D4', 'spellBonus.D4', '+', null);

    } else if(klass == 'Fighter') {
      baseAttack = 'source - 1';
      features = ['Fighting the Unskilled', '9:Attract Followers'];
      hitDie = 10;
      notes = [
        'combatNotes.fightingTheUnskilledFeature:' +
          '%V attacks/round vs. creatures with < 1d8 hit die',
        'featureNotes.attractFollowersFeature:' +
          'May build stronghold and attract followers',
        'featureNotes.bonusFighterExperience:Bonus to awarded experience',
        'validationNotes.fighterClassCharisma:Requires Charisma >= 6',
        'validationNotes.fighterClassConstitution:Requires Constitution >= 7',
        'validationNotes.fighterClassDexterity:Requires Dexterity >= 6',
        'validationNotes.fighterClassStrength:Requires Strength >= 9',
        'validationNotes.fighterClassWisdom:Requires Wisdom >= 6'
      ];
      saveAimed =
        'source<=16 ? 16-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        ' Math.floor((source - 7) / 2)';
      saveBreath =
        'source<=16 ? 17-Math.floor((source-1)/2)-Math.floor((source-1)/4)*2:' +
        'Math.floor((source - 9) / 2)';
      saveDeath =
        'source<=16 ? 14-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        'Math.floor((source - 11) / 2)';
      savePetrification =
        'source<=16 ? 15-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        'Math.floor((source - 9) / 2)';
      saveSpell =
        'source<=16 ? 17-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        'Math.floor((source - 5) / 2)';
      rules.defineRule('attacksPerRound',
        'levels.Fighter', '+', 'Math.floor(source / 6) * 0.5'
      );
      rules.defineRule('combatNotes.fightingTheUnskilledFeature',
        'levels.Fighter', '=', null
      );
      rules.defineRule('featureNotes.bonusFighterExperience',
        'levels.Fighter', '=', '1',
        'strength', '?', 'source >= 16'
      );
      rules.defineRule('warriorLevel', 'levels.Fighter', '+', null);
      // TODO weapon specialization

    } else if(klass == 'Illusionist') {
      baseAttack = '-1 + Math.floor((source - 1) / 5) * 2';
      features = ['10:Attract Followers'];
      hitDie = 4;
      notes = [
        'featureNotes.attractFollowersFeature:' +
          'May build stronghold and attract followers',
        'magicNotes.eldritchCraftFeature:' +
          'May create magical potion/scroll and rechage rods/staves/wands',
        'validationNotes.illusionistClassCharisma:Requires Charisma >= 6',
        'validationNotes.illusionistClassDexterity:Requires Dexterity >= 16',
        'validationNotes.illusionistClassIntelligence:' +
          'Requires Intelligence >= 15',
        'validationNotes.illusionistClassStrength:Requires Strength >= 6',
        'validationNotes.illusionistClassWisdom:Requires Wisdom >= 6'
      ];
      saveAimed = '11 - Math.floor((source-1) / 5) * 2';
      saveBreath = '15 - Math.floor((source-1) / 5) * 2';
      saveDeath = '14 - Math.floor((source-1)/5) - Math.floor((source-1)/10)';
      savePetrification = '13 - Math.floor((source-1) / 5) * 2';
      saveSpell = '12 - Math.floor((source-1) / 5) * 2';
      spellsKnown = [
        'I1:1:1/2:2/4:3/5:4/9:5/17:6',
        'I2:3:1/4:2/5:3/10:4/12:5/18:6',
        'I3:5:1/6:2/9:3/12:4/16:5/20:6',
        'I4:7:1/8:2/11:3/15:4/19:5/21:6',
        'I5:10:1/11:2/16:3/18:4/19:5/23:6',
        'I6:12:1/13:2/17:3/20:4/22:5/24:6',
        'I7:14:1/15:2/21:3/23:4/24:5'
      ];
      rules.defineRule('casterLevelArcane', 'levels.Illusionist', '+=', null);

    } else if(klass == 'Magic User') {
      baseAttack = '-1 + Math.floor((source - 1) / 5) * 2';
      features = [
        '7:Eldritch Craft', '11:Attract Followers', '12:Eldritch Power'
      ];
      hitDie = 4;
      notes = [
        'featureNotes.attractFollowersFeature:' +
          'May build stronghold and attract followers',
        'featureNotes.bonusMagicUserExperience:Bonus to awarded experience',
        'magicNotes.eldritchCraftFeature:' +
          'May create magical potion/scroll and rechage rods/staves/wands',
        'magicNotes.eldritchPowerFeature:May use <i>Enchant an Item</i> spell',
        'validationNotes.magicUserClassCharisma:Requires Charisma >= 6',
        'validationNotes.magicUserClassConstitution:Requires Constitution >= 6',
        'validationNotes.magicUserClassDexterity:Requires Dexterity >= 6',
        'validationNotes.magicUserClassIntelligence:Requires Intelligence >= 9',
        'validationNotes.magicUserClassWisdom:Requires Wisdom >= 6'
      ];
      saveAimed = '11 - Math.floor((source-1) / 5) * 2';
      saveBreath = '15 - Math.floor((source-1) / 5) * 2';
      saveDeath = '14 - Math.floor((source-1)/5) - Math.floor((source-1)/10)';
      savePetrification = '13 - Math.floor((source-1) / 5) * 2';
      saveSpell = '12 - Math.floor((source-1) / 5) * 2';
      spellsKnown = [
        'M1:1:1/2:2/4:3/5:4/12:5/21:6',
        'M2:3:1/4:2/6:3/9:4/13:5/21:6',
        'M3:5:1/6:2/8:3/11:4/14:5/22:6',
        'M4:7:1/8:2/11:3/14:4/17:5/22:6',
        'M5:9:1/10:2/11:3/14:4/17:5/23:6',
        'M6:12:1/13:2/15:3/17:4/19:5/23:6',
        'M7:14:1/15:2/17:3/19:4/22:5/24:6',
        'M8:16:1/17:2/19:3/21:4/24:5',
        'M9:18:1/20:2/23:3'
      ];
      rules.defineRule('casterLevelArcane', 'levels.Magic User', '+=', null);
      rules.defineRule('featureNotes.bonusMagicUserExperience',
        'levels.Magic User', '=', '1',
        'intelligence', '?', 'source >= 16'
      );
      rules.defineRule('understandSpell',
        'levels.Magic User', '?', null,
        'intelligence', '=',
        'source<=9 ? 35 : source<=12 ? 45 : source<=14 ? 55 : ' +
        'source<=16 ? 65 : source==17 ? 75 : source==18 ? 85 : 90'
      );
      rules.defineRule('maximumSpellsPerLevel',
        'levels.Magic User', '?', null,
        'intelligence', '=',
        'source<=9 ? 6 : source<=12 ? 7 : source<=14 ? 9 : ' +
        'source<=16 ? 11 : source==17 ? 14 : source==18 ? 18 : 22'
      );
      rules.defineRule('minimumSpellsPerLevel',
        'levels.Magic User', '?', null,
        'intelligence', '=',
        'source<=9 ? 4 : source<=12 ? 5 : source<=14 ? 6 : ' +
        'source<=16 ? 7 : source==17 ? 8 : source==18 ? 9 : 10'
      );
      rules.defineSheetElement
        ('Understand Spell', 'Spells Known', '<b>%N</b>: %V%');
      rules.defineSheetElement('SpellsPerLevel', 'Spells Known', '%V', '/');
      rules.defineSheetElement
        ('Minimum Spells Per Level', 'SpellsPerLevel/',
         '<b>Min/Max Spells/Level</b>: %V');
      rules.defineSheetElement
        ('Maximum Spells Per Level', 'SpellsPerLevel/', '%V');

    } else if(klass == 'Paladin') {
      baseAttack = 'source - 1';
      features = [
        'Cure Disease', 'Detect Evil', 'Discriminating', 'Divine Health',
        'Lay On Hands', 'Nonmaterialist', 'Philanthropist',
        'Protection From Evil', '3:Turn Undead', '4:Summon Warhorse'
      ];
      hitDie = 10;
      notes = [
        'combatNotes.turnUndeadFeature:' +
          'Turn 2d6/destroy(good) or control (evil) d6+6 undead creatures',
        'featureNotes.bonusPaladinExperience:Bonus to awarded experience',
        'featureNotes.nonmaterialistFeature:' +
          'May not own > 10 magic items, including 1 armor suit and 1 shield',
        'featureNotes.philanthropistFeature:' +
          'Must donate 10% of gross income/100% net to lawful good causes',
        'featureNotes.discriminatingFeature:' +
          'Must not associate w/non-good characters',
        'featureNotes.summonWarhorseFeature:Call warhorse w/enhanced features',
        'magicNotes.cureDiseaseFeature:<i>Cure Disease</i> %V/week',
        'magicNotes.detectEvilFeature:<i>Detect Evil</i> 60\' at will',
        'magicNotes.layOnHandsFeature:Heal %V HP/day',
        'magicNotes.protectionFromEvilFeature:' +
          'Continuous <i>Protection From Evil</i> 10\' radius',
        'saveNotes.divineHealthFeature:Immune to disease',
        'validationNotes.paladinClassAlignment:' +
          'Requires Alignment == Lawful Good',
        'validationNotes.paladinClassCharisma:Requires Charisma >= 17',
        'validationNotes.paladinClassConstitution:Requires Constitution >= 9',
        'validationNotes.paladinClassDexterity:Requires Dexterity >= 6',
        'validationNotes.paladinClassIntelligence:Requires Intelligence >= 9',
        'validationNotes.paladinClassStrength:Requires Strength >= 12',
        'validationNotes.paladinClassWisdom:Requires Wisdom >= 13'
      ];
      saveAimed =
        'source<=16 ? 14-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        ' source<=18 ? 3 : 2';
      saveBreath =
        'source<=16 ? 15-Math.floor((source-1)/2)-Math.floor((source-1)/4)*2 :'+
        '2';
      saveDeath =
        'source<=16 ? 12-Math.floor((source-1)/2)-Math.floor((source-1)/4) : 2';
      savePetrification =
        'source<=16 ? 13-Math.floor((source-1)/2)-Math.floor((source-1)/4) : 2';
      saveSpell =
        'source<=16 ? 15-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        'source <= 18 ? 4 : 3';
      spellsKnown = [
        'C1:9:1/10:2/14:3/21:4',
        'C2:11:1/12:2/16:3/22:4',
        'C3:13:1/17:2/18:3/23:4',
        'C4:15:1/19:2/20:2/24:4'
      ];
      rules.defineRule('attacksPerRound',
        'levels.Paladin', '+', 'Math.floor(source / 7) * 0.5'
      );
      rules.defineRule('casterLevelDivine',
        'levels.Paladin', '+=', 'source<=8 ? null : source<=16 ? source - 8 : 8'
      );
      rules.defineRule('featureNotes.bonusPaladinExperience',
        'levels.Paladin', '=', '1',
        'strength', '?', 'source >= 16',
        'wisdom', '?', 'source >= 16'
      );
      rules.defineRule('magicNotes.cureDiseaseFeature',
        'levels.Paladin', '=', 'Math.floor(source / 5) + 1'
      );
      rules.defineRule
        ('magicNotes.layOnHandsFeature', 'levels.Paladin', '+=', '2 * source');
      rules.defineRule('turningLevel',
        'levels.Paladin', '+=', 'source > 2 ? source - 2 : null'
      );
      rules.defineRule('warriorLevel', 'levels.Paladin', '+', null);
      // TODO weapon specialization

    } else if(klass == 'Ranger') {
      baseAttack = 'source - 1';
      features = [
        'Loner', 'Selective', 'Ranger Favored Enemy', 'Tracking',
        'Travel Light', 'Unsurprised', '10:Scrying', '10:Band of Followers'
      ];
      hitDie = 8;
      notes = [
        'combatNotes.unsurprisedFeature:Surprised only 1in6/surprise 1in2',
        'combatNotes.rangerFavoredEnemyFeature:' +
          '+%V melee damage vs. evil humanoid/giantish foe',
        'featureNotes.bandOfFollowersFeature:Will attract followers',
        'featureNotes.bonusRangerExperience:Bonus to awarded experience',
        'featureNotes.lonerFeature:Will not work with > 2 other rangers',
        'featureNotes.selectiveFeature:Must employ only good henchmen',
        'featureNotes.trackingFeature:' +
          '90% rural/65% urban/dungeon base chance creature tracking',
        'featureNotes.travelLightFeature:' +
          'Will not possess more than can be carried',
        'magicNotes.scryingFeature:May use crystal balls and simiar devices',
        'validationNotes.rangerClassAlignment:Requires Alignment =~ Good',
        'validationNotes.rangerClassCharisma:Requires Charisma >= 6',
        'validationNotes.rangerClassConstitution:Requires Constitution >= 14',
        'validationNotes.rangerClassDexterity:Requires Dexterity >= 6',
        'validationNotes.rangerClassIntelligence:Requires Intelligence >= 13',
        'validationNotes.rangerClassStrength:Requires Strength >= 13',
        'validationNotes.rangerClassWisdom:Requires Wisdom >= 14'
      ];
      saveAimed =
        'source<=16 ? 16-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        'source<=18 ? 5 : 4';
      saveBreath =
        'source<=16 ? 17-Math.floor((source-1)/2)-Math.floor((source-1)/4)*2 :'+
        'source<=18 ? 4 : 3';
      saveDeath =
        'source<=16 ? 14-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        'source<=18 ? 3 : 2'
      savePetrification =
        'source<=16 ? 15-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        'source<=18 ? 4 : 3';
      saveSpell =
        'source<=16 ? 17-Math.floor((source-1)/2)-Math.floor((source-1)/4) : ' +
        'source<=18 ? 6 : 5';
      spellsKnown = [
        'D1:8:1/10:2/18:3/23:4',
        'D2:12:1/14:2/20:3',
        'D3:16:1/17:2/22:3',
        'M1:9:1/11:2/19:3/24:4',
        'M2:13:1/15:2/21:3'
      ];
      rules.defineRule('attacksPerRound',
        'levels.Ranger', '+', 'Math.floor(source / 7) * 0.5'
      );
      rules.defineRule('casterLevelArcane',
        'levels.Ranger', '+=',
        'source <= 9 ? null : source <= 13 ? 1 : source <= 17 ? 2 : 3'
      );
      rules.defineRule('casterLevelDivine',
        'levels.Ranger', '+=',
        'source <= 7 ? null : source <= 11 ? 1 : source <= 15 ? 2 : 3'
      );
      rules.defineRule
        ('combatNotes.rangerFavoredEnemyFeature', 'levels.Ranger', '=', null);
      rules.defineRule('featureNotes.bonusRangerExperience',
        'levels.Ranger', '=', '1',
        'strength', '?', 'source >= 16',
        'intelligence', '?', 'source >= 16',
        'wisdom', '?', 'source >= 16'
      );
      rules.defineRule('warriorLevel', 'levels.Ranger', '+', null);
      // TODO weapon specialization

    } else if(klass == 'Thief') {
      baseAttack = '(source <= 8 ? -1 : 0) + Math.floor((source - 1) / 4) * 2'
      features = ['10:Read Scrolls'];
      hitDie = 6;
      notes = [
        'combatNotes.backstabFeature:' +
          '+4 melee attack/x%V damage when unobserved',
        'featureNotes.bonusThiefExperience:Bonus to awarded experience',
        'magicNotes.readScrollsFeature:Cast arcane spells from scrolls',
        'validationNotes.thiefClassAlignment:' +
          'Requires Alignment =~ Neutral|Evil',
        'validationNotes.thiefClassCharisma:Requires Charisma >= 6',
        'validationNotes.thiefClassConstitution:Requires Constitution >= 6',
        'validationNotes.thiefClassDexterity:Requires Dexterity >= 9',
        'validationNotes.thiefClassIntelligence:Requires Intelligence >= 6',
        'validationNotes.thiefClassStrength:Requires Strength >= 6'
      ];
      saveAimed = '14 - Math.floor((source - 1) / 4) * 2';
      saveBreath = '16 - Math.floor((source - 1) / 4)';
      saveDeath = '13 - Math.floor((source - 1) / 4)';
      savePetrification = '12 - Math.floor((source - 1) / 4)';
      saveSpell = '15 - Math.floor((source - 1) / 4) * 2';
      thiefAbilityLevel = 'source';
      rules.defineRule('combatNotes.backstabFeature',
        'levels.Thief', '+=', '2 + Math.floor((source - 1) / 4)'
      );
      rules.defineRule('featureNotes.bonusThiefExperience',
        'levels.Thief', '=', '1',
        'dexterity', '?', 'source >= 16'
      );
      rules.defineRule('languageCount', 'levels.Thief', '+=', '1');
      rules.defineRule('languages.Thieves\' Cant', 'levels.Thief', '=', '1');

    } else
      continue;

    SRD35.defineClass
      (rules, klass, hitDie, null, baseAttack, null, null,
       null, null, null, null, null, features,
       spellsKnown, null, null);
    if(notes != null)
      rules.defineNote(notes);
    if(saveAimed != null)
      rules.defineRule('save.Aimed', 'levels.' + klass, '+=', saveAimed);
    if(saveBreath != null)
      rules.defineRule('save.Breath', 'levels.' + klass, '+=', saveBreath);
    if(saveDeath != null)
      rules.defineRule('save.Death', 'levels.' + klass, '+=', saveDeath);
    if(savePetrification != null)
      rules.defineRule
        ('save.Petrification', 'levels.' + klass, '+=', savePetrification);
    if(saveSpell != null)
      rules.defineRule('save.Spell', 'levels.' + klass, '+=', saveSpell);
    if(thiefAbilityLevel != null) {
      rules.defineRule
        ('thiefAbilityLevel', 'levels.' + klass, '+=', thiefAbilityLevel);
      rules.defineRule('thiefSkills.Climb Walls',
        'thiefAbilityLevel', '=',
        'source <= 6 ? 78 + source * 2 : source <= 15 ? 84 + source : 99'
      );
      rules.defineRule('thiefSkills.Find Traps',
        'thiefAbilityLevel', '=',
        'source <= 17 ? 21 + source * 4 : source <= 22 ? 55 + source * 2 : 99',
        'dexterity', '+',
        'source<=11 ? 5 * source - 60 : source<=16 ? null : (5 * source - 80)'
      );
      rules.defineRule
        ('thiefSkills.Hear Noise', 'thiefAbilityLevel', '=', '7 + source * 3');
      rules.defineRule('thiefSkills.Hide In Shadows',
        'thiefAbilityLevel', '=',
        'source <= 15 ? 15 + source * 5 : (75 + source)',
        'dexterity', '+',
        'source<=10 ? 5 * source - 55 : source<=16 ? null : (5 * source - 80)'
      );
      rules.defineRule('thiefSkills.Move Quietly',
        'thiefAbilityLevel', '=',
        'source <= 15 ? 15 + source * 5 : (75 + source)',
        'dexterity', '+',
        'source<=12 ? 5 * source - 65 : source<=16 ? null : (5 * source - 80)'
      );
      rules.defineRule('thiefSkills.Open Locks',
        'thiefAbilityLevel', '=',
        'source <= 16 ? 26 + source * 4 : (75 + source)',
        'dexterity', '+',
        'source<=10 ? 5 * source - 55 : source<=15 ? null : (5 * source - 80)'
      );
      rules.defineRule('thiefSkills.Pick Pockets',
        'thiefAbilityLevel', '=',
        'source <= 14 ? 31 + source * 4 : (75 + source)',
        'dexterity', '+',
        'source<=11 ? 5 * source - 60 : source<=17 ? null : (5 * source - 85)'
      );
      rules.defineRule('thiefSkills.Read Languages',
        'thiefAbilityLevel', '=',
        'source == 1 ? 1 : source <= 19 ? -5 + source * 5 : ' +
        'source <= 23 ? 52 + source * 2 : 99'
      );
      rules.defineSheetElement('Thief Skills', 'Skills', null, ' * ');
      for(var skill in {'Climb Walls':'', 'Find Traps':'', 'Hear Noise':'',
                        'Hide In Shadows':'', 'Move Quietly':'',
                        'Open Locks':'', 'Pick Pockets':'',
                        'Read Languages':''}) {
        rules.defineRule('thiefSkills.' + skill,
          'race', '+',
          'FirstEdition.thiefSkillsRacialAdjustments[source + ".' + skill + '"]'
        );
      }
    }

  }

};

/* Defines the rules related to combat. */
FirstEdition.combatRules = function(rules) {
  
  rules.defineRule('armorClass',
    '', '=', '10',
    'armor', '+', 'FirstEdition.armorsArmorClassBonuses[source]',
    'shield', '+', 'source=="None" ? null : -1'
  );
  rules.defineRule('attacksPerRound', '', '=', '1');
  rules.defineRule('baseAttack', '', '=', '0');
  rules.defineRule('meleeAttack', 'baseAttack', '=', null);
  rules.defineRule('rangedAttack', 'baseAttack', '=', null);
  var undeadTypes = [
    '', 'skeleton', 'zombie', 'ghoul', 'shadow', 'wight', 'ghast', 'wraith',
    'mummy', 'spectre', 'vampire', 'ghost', 'lich', 'demon'
  ];
  rules.defineRule('turnUndeadColumn',
    'turningLevel', '=',
    'source <= 3 ? source : source <= 8 ? source + 1 : ' +
    'source <= 13 ? 10 : source <= 18 ? 12 : 13'
  );
  for(var i = 1; i < undeadTypes.length; i++) {
    var automatic = i + 3;
    var destroy = automatic + 2;
    var capable = i - 4;
    rules.defineRule('turnUndead.' + undeadTypes[i],
      'turnUndeadColumn', '=',
      'source < ' + capable + ' ? null : source == ' + capable + ' ? 20 : ' +
      'source >= ' + destroy + ' ? "D" : source >= ' + automatic + ' ? "T" : ' +
      '(22 - (source  - ' + capable + ') * 3)'
    );
  }
};

/* Defines the rules related to character description. */
FirstEdition.descriptionRules = function(rules, alignments, genders) {
  rules.defineChoice('alignments', alignments);
  rules.defineChoice('genders', genders);
};

/* Defines the rules related to equipment. */
FirstEdition.equipmentRules = function(rules, armors, goodies, shields, weapons) {

  rules.defineChoice('armors', armors);
  rules.defineChoice('goodies', goodies);
  rules.defineChoice('shields', shields);
  rules.defineChoice('weapons', weapons);

  for(var i = 0; i < weapons.length; i++) {

    var pieces = weapons[i].split(':');
    var matchInfo = pieces[1].match(/(\d?d\d+(\+(\d+))?)(r(\d+))?/);
    if(! matchInfo)
      continue;

    var damage = matchInfo[1];
    var damagePlus = matchInfo[3];
    var name = pieces[0];
    var range = matchInfo[5];
    var weaponName = 'weapons.' + name;
    var attackBase = !range ? 'meleeAttack' : 'rangedAttack';

    var format = '%V (%1 %2%3';
    if(range)
      format += " R%4'";
    format += ')';

    rules.defineNote(weaponName + ':' + format);

    rules.defineRule('attackBonus.' + name,
      attackBase, '=', null,
      'combatNotes.strengthAttackAdjustment', '=', null,
      'weaponAttackAdjustment.' + name, '+', null
    );
    rules.defineRule('damageBonus.' + name,
      '', '=', damagePlus || '0',
      'combatNotes.strengthDamageAdjustment', '=', null,
      'weaponDamageAdjustment.' + name, '+', null
    );

    rules.defineRule(weaponName + '.1',
      'attackBonus.' + name, '=', 'source < 0 ? source : ("+" + source)'
    );
    rules.defineRule(weaponName + '.2', '', '=', '"' + damage + '"');
    rules.defineRule(weaponName + '.3',
      'damageBonus.' + name, '=', 'source < 0 ? source : source == 0 ? "" : ("+" + source)'
    );

    if(range) {
      rules.defineRule('range.' + name,
        '', '=', range,
        'weaponRangeAdjustment.' + name, '+', null
      );
      rules.defineRule(weaponName + '.4', 'range.' + name, '=', null);
    }

  }

};

/* Defines the rules related to spells. */
FirstEdition.magicRules = function(rules, classes, schools) {

  rules.defineChoice('schools', schools);
  schools = rules.getChoices('schools');

  var spellsDefined = {};

  for(var i = 0; i < classes.length; i++) {
    var klass = classes[i];
    var spells;
    if(klass == 'Cleric') {
      spells = [
        'C1:Bless:Command:Create Water:Cure Light Wounds:Detect Evil:' +
        'Detect Magic:Light:Protection From Evil:Purify Food And Drink:' +
        'Remove Fear:Resist Cold:Sanctuary',
        'C2:Augury:Chant:Detect Charm:Find Traps:Hold Person:Know Alignment:' +
        'Resist Fire:Silence 15\' Radius:Slow Poison:Snake Charm:' +
        'Speak With Animals:Spiritual Weapon',
        'C3:Animate Dead:Continual Light:Create Food And Water:' +
        'Cure Blindness:Cure Disease:Dispel Magic:Feign Death:' +
        'Glyph Of Warding:Locate Object:Prayer:Remove Curse:Speak With Dead',
        'C4:Cure Serious Wounds:Detect Lie:Divination:Exorcise:Lower Water:' +
        'Neutralize Poison:Protection From Evil 10\' Radius:' +
        'Speak With Plants:Sticks To Snakes:Tongues',
        'C5:Atonement:Commune:Cure Critical Wounds:Dispel Evil:Flame Strike:' +
        'Insect Plague:Plane Shift:Quest:Raise Dead:True Seeing',
        'C6:Aerial Servant:Animate Object:Blade Barrier:Conjure Animals:' +
        'Find The Path:Heal:Part Water:Speak With Monsters:Stone Tell:' +
        'Word Of Recall',
        'C7:Astral Spell:Control Weather:Earthquake:Gate:Holy Word:' +
        'Regenerate:Restoration:Resurrection:Symbol:Wind Walk'
      ];
    } else if(klass == 'Druid') {
      spells = [
        'D1:Animal Friendship:Detect Magic:Detect Pits And Snares:Entangle:' +
        'Faerie Fire:Invisibility To Animals:Locate Animals:' +
        'Pass Without Trace:Predict Weather:Purify Water:Shillelagh:' +
        'Speak With Animals',
        'D2:Barkskin:Charm Person Or Mammal:Create Water:Cure Light Wounds:' +
        'Feign Death:Fire Trap:Heat Metal:Locate Plants:Obscurement:' +
        'Produce Flame:Trip:Warp Wood',
        'D3:Call Lightning:Cure Disease:Hold Animal:Neutralize Poison:' +
        'Plant Growth:Protection From Fire:Pyrotechnics:Snare:Stone Shape:' +
        'Summon Insects:Tree:Water Breathing',
        'D4:Animal Summoning I:Call Woodland Beings:' +
        'Control Temperature 10\' Radius:Cure Serious Wounds:Dispel Magic:' +
        'Hallucinatory Forest:Hold Plant:Plant Door:Produce Fire:' +
        'Protection From Lightning:Repel Insects:Speak With Plants',
        'D5:Animal Growth:Animal Summoning II:Anti-Plant Shell:' +
        'Commune With Nature:Control Winds:Insect Plague:Pass Plant:' +
        'Sticks To Snakes:Transmute Rock To Mud:Wall Of Fire',
        'D6:Animal Summoning III:Anti-Animal Shell:Conjure Fire Elemental:' +
        'Cure Critical Wounds:Feeblemind:Fire Seeds:Transport Via Plants:' +
        'Turn Wood:Wall Of Thorns:Weather Summoning',
        'D7:Animate Rock:Chariot Of Fire:Confusion:Conjure Earth Elemental:' +
        'Control Weather:Creeping Doom:Finger Of Death:Fire Storm:' +
        'Reincarnate:Transmute Metal To Wood'
      ];
    } else if(klass == 'Illusionist') {
      spells = [
        'I1:Audible Glamer:Change Self:Color Spray:Dancing Lights:Darkness:' +
        'Detect Illusion:Detect Invisibility:Gaze Reflection:Hypnotism:Light:' +
        'Phantasmal Force:Wall Of Fog',
        'I2:Blindness:Blur:Deafness:Detect Magic:Fog Cloud:Hypnotic Pattern:' +
        'Improved Phantasmal Force:Invisibility:Magic Mouth:Mirror Image:' +
        'Misdirection:Ventriloquism',
        'I3:Continual Darkness:Continual Light:Dispel Illusion:Fear:' +
        'Hallucinatory Terrain:Illusory Script:Invisibility 10\' Radius:' +
        'Non-Detection:Paralyzation:Rope Trick:Spectral Force:Suggestion',
        'I4:Confusion:Dispel Exhaustion:Emotion:Improved Invisibility:' +
        'Massmorph:Minor Creation:Phantasmal Killer:Shadow Monsters',
        'I5:Chaos:Demi-Shadow Monsters:Major Creation:Maze:Project Image:' +
        'Shadow Door:Shadow Magic:Summon Shadow',
        'I6:Conjure Animals:Demi-Shadow Magic:Mass Suggestion:' +
        'Permanent Illusion:Programmed Illusion:Shades:True Sight:Veil',
        'I7:Alter Reality:Astral Spell:Prismatic Spray:Prismatic Wall:' +
        'Vision:Arcane Spells Level 1'
      ];
    } else if(klass == 'Magic User') {
      spells = [
        'M1:Affect Normal Fires:Burning Hands:Charm Person:' +
        'Comprehend Languages:Dancing Lights:Detect Magic:Enlarge:Erase:' +
        'Feather Fall:Find Familiar:Floating Disk:Friends:Hold Portal:' +
        'Identify:Jump:Light:Magic Aura:Magic Missle:Mending:Message:' +
        'Protection From Evil:Push:Read Magic:Shield:Shocking Grasp:Sleep:' +
        'Spider Climb:Unseen Servant:Ventriloquism:Write',
        'M2:Audible Glamer:Continual Light:Darkness:Detect Evil:' +
        'Detect Invisibility:ESP:Fool\'s Gold:Forget:Invisibility:Knock:' +
        'False Trap:Levitate:Locate Object:Magic Mouth:Mirror Image:' +
        'Pyrotechnics:Ray Of Enfeeblement:Rope Trick:Scare:Shatter:' +
        'Stinking Cloud:Strength:Web:Wizard Lock',
        'M3:Blink:Clairaudience:Clairvoyance:Dispel Magic:Explosive Runes:' +
        'Feign Death:Fireball:Flame Arrow:Fly:Gust Of Wind:Haste:Hold Person:' +
        'Infravision:Invisibility 10\' Radius:Lightning Bolt:' +
        'Monster Summoning I:Phantasmal Force:' +
        'Protection From Evil 10\' Radius:Protection From Normal Missles:' +
        'Slow:Suggestion:Tiny Hut:Tongues:Water Breathing',
        'W4:Charm Monster:Confusion:Dig:Dimension Door:Enchanted Weapon:' +
        'Extension I:Fear:Fire Charm:Fire Shield:Fire Trap:Fumble:' +
        'Hallucinatory Terrain:Ice Storm:Massmorph:' +
        'Minor Globe Of Invulnerability:Mnemonic Enhancement:' +
        'Monster Summoning II:Plant Growth:Polymorph Other:Polymorph Self:' +
        'Remove Curse:Wall Of Fire:Wall Of Ice:Wizard Eye',
        'W5:Airy Water:Animal Growth:Animate Dead:Cloudkill:Cone Of Cold:' +
        'Conjure Elemental:Contact Other Plane:Distance Distortion:' +
        'Extension II:Feeblemind:Hold Monster:Interposing Hand:' +
        'Mage\'s Faithful Hound:Magic Jar:Monster Summoning III:Passwall:' +
        'Secret Chest:Stone Shape:Telekinesis:Teleport:' +
        'Transmute Rock To Mud:Wall Of Force:Wall Of Iron:Wall Of Stone',
        'W6:Anti-Magic Shell:Control Weather:Death Spell:Disintegrate:' +
        'Enchant An Item:Extension III:Forceful Hand:Freezing Sphere:Geas:' +
        'Glasseye:Globe Of Invulnerability:Guards And Wards:' +
        'Invisible Stalker:Legend Lore:Lower Water:Monster Summoning IV:' +
        'Move Earth:Part Water:Project Image:Reincarnate:Repulsion:' +
        'Spirit-Rack:Stone To Flesh:Transformation',
        'W7:Cacodemon:Charm Plants:Delayed Blast Fireball:Duo-Dimension:' +
        'Grasping Hand:Instant Summons:Limited Wish:Mage\'s Sword:' +
        'Mass Invisibility:Monster Summoning V:Phase Door:Power Word Stun:' +
        'Reverse Gravity:Simulacrum:Statue:Vanish',
        'W8:Antipathy/Sympathy:Clenched Fist:Clone:Glass-Steel:' +
        'Incendiary Cloud:Irresistible Dance:Mass Charm:Maze:Mind Blank:' +
        'Monster Summoning VI:Permanency:Polymorph Object:Power Word Blind:' +
        'Spell Immunity:Symbol:Trap The Soul',
        'W9:Astral Spell:Crushing Hand:Gate:Imprisonment:Meteor Swarm:' +
        'Monster Summoning VII:Power Word Kill:Prismatic Sphere:Shape Change:' +
        'Temporal Statis:Time Stop:Wish'
      ];
    } else if(klass == 'Paladin') {
      spells = [
        'C1:Bless:Command:Create Water:Cure Light Wounds:Detect Evil:' +
        'Detect Magic:Light:Protection From Evil:Purify Food And Drink:' +
        'Remove Fear:Resist Cold:Sanctuary',
        'C2:Augury:Chant:Detect Charm:Find Traps:Hold Person:Know Alignment:' +
        'Resist Fire:Silence 15\' Radius:Slow Poison:Snake Charm:' +
        'Speak With Animals:Spiritual Weapon',
        'C3:Animate Dead:Continual Light:Create Food And Water:' +
        'Cure Blindness:Cure Disease:Dispel Magic:Feign Death:' +
        'Glyph Of Warding:Locate Object:Prayer:Remove Curse:Speak With Dead',
        'C4:Cure Serious Wounds:Detect Lie:Divination:Exorcise:Lower Water:' +
        'Neutralize Poison:Protection From Evil 10\' Radius:' +
        'Speak With Plants:Sticks To Snakes:Tongues'
      ];
    } else if(klass == 'Ranger') {
      spells = [
        'D1:Animal Friendship:Detect Magic:Detect Pits And Snares:Entangle:' +
        'Faerie Fire:Invisibility To Animals:Locate Animals:' +
        'Pass Without Trace:Predict Weather:Purify Water:Shillelagh:' +
        'Speak With Animals',
        'D2:Barkskin:Charm Person Or Mammal:Create Water:Cure Light Wounds:' +
        'Feign Death:Fire Trap:Heat Metal:Locate Plants:Obscurement:' +
        'Produce Flame:Trip:Warp Wood',
        'D3:Call Lightning:Cure Disease:Hold Animal:Neutralize Poison:' +
        'Plant Growth:Protection From Fire:Pyrotechnics:Snare:Stone Shape:' +
        'Summon Insects:Tree:Water Breathing',
        'M1:Affect Normal Fires:Burning Hands:Charm Person:' +
        'Comprehend Languages:Dancing Lights:Enlarge:Erase:Feather Fall:' +
        'Find Familiar:Floating Disk:Friends:Hold Portal:Identify:Jump:Light:' +
        'Magic Aura:Magic Missle:Mending:Message:Protection From Evil:Push:' +
        'Read Magic:Shield:Shocking Grasp:Sleep:Spider Climb:Unseen Servant:' +
        'Ventriloquism:Write',
        'M2:Audible Glamer:Continual Light:Darkness:Detect Evil:' +
        'Detect Invisibility:ESP:Fool\'s Gold:Forget:Invisibility:Knock:' +
        'False Trap:Levitate:Locate Object:Magic Mouth:Mirror Image:' +
        'Pyrotechnics:Ray Of Enfeeblement:Rope Trick:Scare:Shatter:' +
        'Stinking Cloud:Strength:Web:Wizard Lock'
      ];
    } else
      continue;
    if(spells != null) {
      for(var j = 0; j < spells.length; j++) {
        var pieces = spells[j].split(':');
        for(var k = 1; k < pieces.length; k++) {
          var spell = pieces[k];
          var school = FirstEdition.spellsSchools[spell];
          spellsDefined[spell] = '';
          spell += '(' + pieces[0] + ' ' +
                    (school == 'Universal' ? 'Univ' : schools[school]) + ')';
          rules.defineChoice('spells', spell);
        }
      }
    }
  }

  rules.defineRule('casterLevel',
    'casterLevelArcane', '+=', null,
    'casterLevelDivine', '+=', null
  );

}

/* Defines the rules related to character movement. */
FirstEdition.movementRules = function(rules) {
  rules.defineRule('loadLight',
    '', '=', '35',
    'abilityNotes.strengthEncumbranceAdjustment', '+', null
  );
  rules.defineRule('loadMedium',
    '', '=', '70',
    'abilityNotes.strengthEncumbranceAdjustment', '+', null
  );
  rules.defineRule('loadMax',
    '', '=', '105',
    'abilityNotes.strengthEncumbranceAdjustment', '+', null
  );
  rules.defineRule('speed', '', '=', '120');
};

/* Defines the rules related to character races. */
FirstEdition.raceRules = function(rules, languages, races) {

  rules.defineChoice('languages', languages);
  rules.defineRule('languageBonus',
    'race', 'v',
    'source == "Human" ? null : ' +
    'source.indexOf("Elf") >= 0 && source != "Half Elf" ? 3 : 2'
  );

  rules.defineNote
    ('validationNotes.languagesTotal:Allocated languages differ from ' +
     'language total by %V');
  rules.defineRule('validationNotes.languagesTotal',
    'languageCount', '+=', '-source',
    /^languages\./, '+=', null
  );

  for(var i = 0; i < races.length; i++) {

    // TODO: level limits
    var adjustment, features, languages, notes;
    var race = races[i];
    var raceNoSpace =
      race.substring(0,1).toLowerCase() + race.substring(1).replace(/ /g, '');

    if(race == 'Half Elf') {

      adjustment = null;
      features = [
        'Detect Secret Doors', 'Infravision', 'Resist Charm', 'Resist Sleep'
      ];
      languages = [
        'Common', 'Elven', 'Gnoll', 'Gnome', 'Goblin', 'Halfling', 'Hobgoblin',
        'Orcish'
      ];
      notes = [
        'featureNotes.detectSecretDoorsFeature:' +
          '1in6 passing, 2in6 searching, 3in6 concealed',
        'featureNotes.infravisionFeature:%V ft vision in darkness',
        'saveNotes.resistCharmFeature:%V% vs. charm',
        'saveNotes.resistSleepFeature:%V% vs. sleep',
        'validationNotes.halfElfRaceDexterity:Requires Dexterity >= 6',
        'validationNotes.halfElfRaceConstitution:Requires Constitution >= 6',
        'validationNotes.halfElfRaceIntelligence:Requires Intelligence >= 4'
      ];
      rules.defineRule('featureNotes.infravisionFeature',
        'halfElfFeatures.Infravision', '+=', '60'
      );
      rules.defineRule('saveNotes.resistCharmFeature',
        'halfElfFeatures.Resist Charm', '+=', '30'
      );
      rules.defineRule('saveNotes.resistSleepFeature',
        'halfElfFeatures.Resist Sleep', '+=', '30'
      );
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Hide In Shadows'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Pick Pockets'] = 10;

    } else if(race == 'Half Orc') {

      adjustment = '+1 strength/+1 constitution/-2 charisma';
      features = ['Infravision'];
      languages = ['Common', 'Orcish'];
      notes = [
        'featureNotes.infravisionFeature:%V ft vision in darkness',
        'validationNotes.halfOrcRaceCharisma:Requires Charisma <= 12',
        'validationNotes.halfOrcRaceConstitution:Requires Constitution >= 13',
        'validationNotes.halfOrcRaceDexterity:Requires Dexterity <= 17',
        'validationNotes.halfOrcRaceIntelligence:Requires Intelligence <= 17',
        'validationNotes.halfOrcRaceWisdom:Requires Wisdom <= 14',
        'validationNotes.halfOrcRaceStrength:Requires Strength >= 6'
      ];
      rules.defineRule('featureNotes.infravisionFeature',
        'halfOrcFeatures.Infravision', '+=', '60'
      );
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Climb Walls'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Find Traps'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Hear Noise'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Open Locks'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Pick Pockets'] = -5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Read Languages'] = -10;

    } else if(race.match(/Dwarf/)) {

      adjustment = '+1 constitution/-1 charisma';
      features = [
        'Dodge Giants', 'Dwarf Favored Enemy', 'Infravision', 'Know Depth',
        'Know Stone', 'Resist Magic', 'Resist Poison', 'Sense Construction',
        'Sense Slope', 'Slow'
      ];
      languages = [
        'Common', 'Dwarfish', 'Gnomish', 'Goblin', 'Kobold', 'Orcish'
      ];
      notes = [
        'combatNotes.dodgeGiantsFeature:-4 AC vs. giant creatures',
        'combatNotes.dwarfFavoredEnemyFeature:+1 attack vs. goblinoid/orc',
        'featureNotes.infravisionFeature:%V ft vision in darkness',
        'featureNotes.knowDepthFeature:' +
          'Determine approximate depth underground %V%',
        'featureNotes.knowStoneFeature:Detect stonework traps 50% w/in 10 ft',
        'featureNotes.senseConstructionFeature:' +
          'Detect new construction 75%/sliding walls 66% w/in 10 ft',
        'featureNotes.senseSlopeFeature:Detect slope/grade %V% w/in 10 ft',
        'saveNotes.resistMagicFeature:+%V vs. aimed/spells',
        'saveNotes.resistPoisonFeature:+%V vs. poison',
        'validationNotes.'+raceNoSpace+'RaceCharisma:Requires Charisma <= 16',
        'validationNotes.'+raceNoSpace+'RaceConstitution:' +
          'Requires Constitution >= 12',
        'validationNotes.'+raceNoSpace+'RaceDexterity:Requires Dexterity <= 17',
        'validationNotes.'+raceNoSpace+'RaceStrength:Requires Strength >= 8'
      ];
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Climb Walls'] = -10;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Find Traps'] = 15;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Move Quietly'] = -5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Open Locks'] = 15;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Read Languages'] = -5;

      rules.defineRule('featureNotes.infravisionFeature',
        raceNoSpace + 'Features.Infravision', '+=', '60'
      );
      rules.defineRule('featureNotes.knowDepthFeature',
        raceNoSpace + 'Features.Know Depth', '+=', '50'
      );
      rules.defineRule('featureNotes.senseSlopeFeature',
        raceNoSpace + 'Features.Sense Slope', '+=', '75'
      );
      rules.defineRule('save.Aimed', 'saveNotes.resistMagicFeature', '+', null);
      rules.defineRule('save.Spell', 'saveNotes.resistMagicFeature', '+', null);
      rules.defineRule('saveNotes.resistMagicFeature',
        'constitution', '=', 'Math.floor(source / 3.5)'
      );
      rules.defineRule('saveNotes.resistPoisonFeature',
        'constitution', '=', 'Math.floor(source / 3.5)'
      );
      rules.defineRule('speed', 'features.Slow', '+', '-30');

    } else if(race.match(/Elf/)) {

      adjustment = '+1 dexterity/-1 constitution';
      features = [
        'Bow Precision', 'Detect Secret Doors', 'Infravision', 'Resist Charm',
        'Resist Sleep', 'Stealthy', 'Sword Precision'
      ];
      languages = [
        'Common', 'Elven', 'Gnoll', 'Gnomish', 'Goblin', 'Halfling',
        'Hobgoblin', 'Orcish'
      ];
      notes = [
        'combatNotes.bowPrecisionFeature:+1 attack w/bows',
        'combatNotes.swordPrecisionFeature:+1 attack w/longsword/short sword',
        'combatNotes.stealthyFeature:4in6 surprise when traveling quietly',
        'featureNotes.detectSecretDoorsFeature:' +
          '1in6 passing, 2in6 searching, 3in6 concealed',
        'featureNotes.infravisionFeature:%V ft vision in darkness',
        'saveNotes.resistCharmFeature:%V% vs. charm',
        'saveNotes.resistSleepFeature:%V% vs. sleep',
        'validationNotes.'+raceNoSpace+'RaceCharisma:Requires Charisma >= 8',
        'validationNotes.'+raceNoSpace+'RaceConstitution:' +
          'Requires Constitution >= 8',
        'validationNotes.'+raceNoSpace+'RaceDexterity:Requires Dexterity >= 7',
        'validationNotes.'+raceNoSpace+'RaceIntelligence:' +
          'Requires Intelligence >= 8'
      ];
      rules.defineRule('featureNotes.infravisionFeature',
        raceNoSpace + 'Features.Infravision', '+=', '60'
      );
      rules.defineRule('saveNotes.resistCharmFeature',
        raceNoSpace + 'Features.Resist Charm', '+=', '90'
      );
      rules.defineRule('saveNotes.resistSleepFeature',
        raceNoSpace + 'Features.Resist Sleep', '+=', '90'
      );
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Climb Walls'] = -5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Find Traps'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Hear Noise'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Hide In Shadows'] = 10;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Move Quietly'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Open Locks'] = -5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Pick Pockets'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Read Languages'] = 10;

    } else if(race.match(/Gnome/)) {

      adjustment = null;
      features = [
        'Burrow Friend', 'Direction Sense', 'Dodge Giants',
        'Gnome Favored Enemy', 'Infravision', 'Know Depth', 'Resist Magic',
        'Resist Poison', 'Sense Hazard', 'Sense Slope', 'Slow'
      ];
      languages = [
        'Common', 'Dwarfish', 'Gnomish', 'Goblin', 'Halfling', 'Kobold'
      ];
      notes = [
        'combatNotes.gnomeFavoredEnemyFeature:+1 attack vs. goblins/kobolds',
        'combatNotes.dodgeGiantsFeature:-4 AC vs. giant creatures',
        'featureNotes.burrowFriendFeature:Speak w/burrowing animals',
        'featureNotes.directionSenseFeature:Determine N underground 50%',
        'featureNotes.infravisionFeature:%V ft vision in darkness',
        'featureNotes.knowDepthFeature:' +
          'Determine approximate depth underground %V%',
        'featureNotes.senseHazardFeature:' +
          'Detect unsafe wall/ceiling/floor 70% w/in 10 ft',
        'featureNotes.senseSlopeFeature:Detect slope/grade %V% w/in 10 ft',
        'saveNotes.resistMagicFeature:+%V vs. aimed/spells',
        'saveNotes.resistPoisonFeature:+%V vs. poison',
        'validationNotes.'+raceNoSpace+'RaceStrength:Requires Strength >= 6',
        'validationNotes.'+raceNoSpace+'RaceConstitution:' +
          'Requires Constitution >= 8',
        'validationNotes.'+raceNoSpace+'RaceIntelligence:' +
          'Requires Intelligence >= 7'
      ];
      rules.defineRule('featureNotes.infravisionFeature',
        raceNoSpace + 'Features.Infravision', '+=', '60'
      );
      rules.defineRule('featureNotes.knowDepthFeature',
        raceNoSpace + 'Features.Know Depth', '+=', '60'
      );
      rules.defineRule('featureNotes.senseSlopeFeature',
        raceNoSpace + 'Features.Sense Slope', '+=', '80'
      );
      rules.defineRule('save.Aimed', 'saveNotes.resistMagicFeature', '+', null);
      rules.defineRule('save.Spell', 'saveNotes.resistMagicFeature', '+', null);
      rules.defineRule('saveNotes.resistMagicFeature',
        'constitution', '=', 'Math.floor(source / 3.5)'
      );
      rules.defineRule('saveNotes.resistPoisonFeature',
        'constitution', '=', 'Math.floor(source / 3.5)'
      );
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Climb Walls'] = -15;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Hear Noise'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Open Locks'] = 10;

    } else if(race.match(/Halfling/)) {

      adjustment = '+1 dexterity/-1 strength';
      features = [
        'Accurate', 'Resist Magic', 'Infravision', 'Resist Poison', 'Slow',
        'Stealthy'
      ];
      languages = [
        'Common', 'Dwarfish', 'Gnome', 'Goblin', 'Halfling', 'Orcish'
      ];
      notes = [
        'combatNotes.accurateFeature:+3 attack with sling/bow',
        'combatNotes.stealthyFeature:4in6 surprise when traveling quietly',
        'featureNotes.infravisionFeature:%V ft vision in darkness',
        'saveNotes.resistMagicFeature:+%V vs. aimed/spells',
        'saveNotes.resistPoisonFeature:+%V vs. poison',
        'validationNotes.'+raceNoSpace+'RaceStrength:Requires Strength >= 6',
        'validationNotes.'+raceNoSpace+'RaceDexterity:Requires Dexterity >= 8',
        'validationNotes.'+raceNoSpace+'RaceConstitution:' +
          'Requires Constitution >= 10',
        'validationNotes.'+raceNoSpace+'RaceIntelligence:' +
          'Requires Intelligence >= 6',
        'validationNotes.'+raceNoSpace+'RaceWisdom:Requires Wisdom <= 17'
      ];
      rules.defineRule('featureNotes.infravisionFeature',
        raceNoSpace + 'Features.Infravision', '+=', '60'
      );
      rules.defineRule('save.Aimed', 'saveNotes.resistMagicFeature', '+', null);
      rules.defineRule('save.Spell', 'saveNotes.resistMagicFeature', '+', null);
      rules.defineRule('saveNotes.resistMagicFeature',
        'constitution', '=', 'Math.floor(source / 3.5)'
      );
      rules.defineRule('saveNotes.resistPoisonFeature',
        'constitution', '=', 'Math.floor(source / 3.5)'
      );
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Climb Walls'] = -15;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Hear Noise'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Hide In Shadows'] = 15;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Move Quietly'] = 15;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Pick Pockets'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Read Languages'] = -5;

    } else if(race.match(/Human/)) {

      adjustment = null;
      features = null;
      notes = null;
      languages = ['Common'];
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Climb Walls'] = 5;
      FirstEdition.thiefSkillsRacialAdjustments[race + '.Open Locks'] = 5;

    } else
      continue;

    SRD35.defineRace(rules, race, adjustment, features);

    rules.defineRule
      ('isRace.' + race, 'race', '=', 'source == "' + race + '" ? 1 : null');
    rules.defineRule('languageCount', 'isRace.' + race, '=', languages.length);
    for(var j = 0; j < languages.length; j++) {
      rules.defineRule('languages.' + languages[j], 'isRace.' + race, '=', '1');
    }

    if(notes != null)
      rules.defineNote(notes);

  }

};


/* Returns HTML body content for user notes associated with this rule set. */
FirstEdition.ruleNotes = function() {
  return '' +
    '<h2>FirstEdition Scribe Module Notes</h2>\n' +
    'FirstEdition Scribe Module Version ' + FirstEdition_VERSION + '\n' +
    '\n' +
    '<h3>Usage Notes</h3>\n';
};
