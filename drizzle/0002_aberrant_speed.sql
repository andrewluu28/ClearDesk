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
		"keywords": ["focused", "zoned", "ergonomic", "accessible", "precise"],
		"requiredSignals": ["clearly defined work zones", "aligned primary equipment", "frequently used tools within reach", "controlled documents and cables"],
		"conflictingSignals": ["decorative distractions", "duplicate organizers", "blocked primary work area", "loose visible cables", "rarely used supplies in reach zones"],
		"preferredObjects": ["angled document stand", "compact focus timer", "cable management dock", "single action notebook", "supportive laptop or monitor riser"],
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
