ALTER TABLE "organization_styles" ADD COLUMN "visual_profile" jsonb;

UPDATE "organization_styles"
SET "visual_profile" = CASE "slug"
	WHEN 'minimalist' THEN '{
		"keywords": ["purposeful", "focused", "tidy", "restrained", "quiet", "generous negative space"],
		"requiredSignals": ["large areas of open work surface", "only purposeful task-relevant objects remain visible", "existing notebook or work materials are preserved and neatly aligned", "small loose items are grouped or consolidated rather than erased", "cohesive neutral colors"],
		"conflictingSignals": ["scattered small objects", "duplicate containers", "misaligned loose paper that is not part of a notebook or active work", "decorative objects without a clear function", "visible cable tangles"],
		"preferredObjects": ["slim neutral desk mat", "small lidded storage box", "minimal catchall tray"],
		"palette": ["warm white", "pale gray", "natural wood", "matte black"],
		"materials": ["felt", "light wood", "matte metal", "stoneware"],
		"maxNewItems": 1
	}'::jsonb
	WHEN 'cozy' THEN '{
		"keywords": ["warm", "tactile", "layered", "personal", "lived-in"],
		"requiredSignals": ["warm layered lighting", "natural or soft texture", "curated personal objects", "comfortable usable work area"],
		"conflictingSignals": ["cold clinical lighting", "sterile empty surfaces", "uncontrolled clutter", "harsh corporate styling"],
		"preferredObjects": ["compact warm desk lamp", "small leafy plant", "framed personal photo or artwork", "fabric desk mat", "ceramic mug and coaster"],
		"palette": ["warm wood", "oatmeal", "muted sage", "soft amber"],
		"materials": ["wood", "linen", "matte ceramic", "woven fiber"],
		"maxNewItems": 3
	}'::jsonb
	WHEN 'productivity' THEN '{
		"keywords": ["ready-to-work", "focused", "low-friction", "zoned", "ergonomic", "aligned", "deliberate"],
		"requiredSignals": ["one clear central work axis with the primary screen and input devices aligned", "straight object edges that run parallel or perpendicular to the desk edge", "one obvious active-work zone with a single next-action surface", "frequently used tools within reach and occasional supplies moved outward", "reference material supported without blocking the work surface", "one controlled cable route behind or beside the primary equipment"],
		"conflictingSignals": ["multiple competing work areas", "crooked or randomly oriented equipment", "decorative or novelty objects inside the active work zone", "duplicate organizers", "blocked primary work area", "loose visible cables", "scattered pens and supplies", "rarely used supplies occupying the immediate reach zone"],
		"preferredObjects": ["supportive laptop or monitor riser", "single action notebook with one pen", "compact analog focus timer", "angled document stand", "cable management dock"],
		"palette": ["charcoal", "desaturated blue-gray", "white", "natural wood"],
		"materials": ["powder-coated metal", "felt", "matte plastic", "wood"],
		"maxNewItems": 3
	}'::jsonb
	ELSE '{
		"keywords": [],
		"requiredSignals": [],
		"conflictingSignals": [],
		"preferredObjects": [],
		"palette": [],
		"materials": [],
		"maxNewItems": 3
	}'::jsonb
END;

ALTER TABLE "organization_styles" ALTER COLUMN "visual_profile" SET NOT NULL;
