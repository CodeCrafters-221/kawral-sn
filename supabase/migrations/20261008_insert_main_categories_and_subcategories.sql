-- Migration : Insertion des 8 catégories principales et des sous-catégories associées dans Kawral

-- 1. Insertion / Mise à jour des 8 catégories principales (parent_id IS NULL)
INSERT INTO public.categories (name, slug, parent_id, icon_url)
VALUES
    ('Immobilier', 'immobilier', NULL, 'building-2'),
    ('Véhicules', 'vehicules', NULL, 'car'),
    ('Matériel pro', 'materiel-pro', NULL, 'briefcase'),
    ('Mode', 'mode', NULL, 'shirt'),
    ('Maison & jardin', 'maison-jardin', NULL, 'armchair'),
    ('Électronique', 'electronique', NULL, 'smartphone'),
    ('Loisirs', 'loisirs', NULL, 'gamepad-2'),
    ('Autres', 'autres', NULL, 'package')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon_url = EXCLUDED.icon_url,
    parent_id = NULL;

-- 2. Insertion et rattachement des sous-catégories existantes via parent_id
DO $$
DECLARE
    v_immo_id UUID;
    v_vehic_id UUID;
BEGIN
    SELECT id INTO v_immo_id FROM public.categories WHERE slug = 'immobilier';
    SELECT id INTO v_vehic_id FROM public.categories WHERE slug = 'vehicules';

    -- Sous-catégories rattachées à Immobilier
    IF v_immo_id IS NOT NULL THEN
        INSERT INTO public.categories (name, slug, parent_id, icon_url)
        VALUES
            ('Appartements', 'apartment', v_immo_id, 'building-2'),
            ('Maisons & Villas', 'house', v_immo_id, 'home'),
            ('Terrains & Parcelles', 'land', v_immo_id, 'tree-pine'),
            ('Locaux commerciaux', 'commercial', v_immo_id, 'store'),
            ('Chambres meublées', 'room', v_immo_id, 'bed')
        ON CONFLICT (slug) DO UPDATE SET
            parent_id = v_immo_id,
            name = EXCLUDED.name,
            icon_url = EXCLUDED.icon_url;
    END IF;

    -- Sous-catégories rattachées à Véhicules
    IF v_vehic_id IS NOT NULL THEN
        INSERT INTO public.categories (name, slug, parent_id, icon_url)
        VALUES
            ('Voitures', 'voitures', v_vehic_id, 'car'),
            ('Motos & Scooters', 'motos', v_vehic_id, 'bike'),
            ('Utilitaires & Poids lourds', 'utilitaires', v_vehic_id, 'truck')
        ON CONFLICT (slug) DO UPDATE SET
            parent_id = v_vehic_id,
            name = EXCLUDED.name,
            icon_url = EXCLUDED.icon_url;
    END IF;
END $$;
