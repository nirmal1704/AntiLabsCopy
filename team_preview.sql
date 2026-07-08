CREATE OR REPLACE FUNCTION public.preview_team_by_code(p_team_code text)
RETURNS TABLE (
    id uuid,
    name text,
    unique_team_code text,
    captain_name text,
    member_names text[]
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.unique_team_code,
        c.full_name AS captain_name,
        ARRAY(
            SELECT p.full_name 
            FROM hacklabs_personal_details p 
            WHERE p.team_id = t.id AND p.auth_id != t.captain_id
        ) AS member_names
    FROM hacklabs_teams t
    LEFT JOIN hacklabs_personal_details c ON t.captain_id = c.auth_id
    WHERE t.unique_team_code = p_team_code;
END;
$$ LANGUAGE plpgsql;
