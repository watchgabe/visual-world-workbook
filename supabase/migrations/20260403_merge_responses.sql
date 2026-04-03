-- Atomically merge fields into blp_responses.responses JSONB column.
-- Inserts a new row if none exists, otherwise merges via || operator.
create or replace function merge_responses(
  p_user_id uuid,
  p_module_slug text,
  p_data jsonb
) returns void as $$
begin
  insert into blp_responses (user_id, module_slug, responses, updated_at)
  values (p_user_id, p_module_slug, p_data, now())
  on conflict (user_id, module_slug)
  do update set
    responses = blp_responses.responses || p_data,
    updated_at = now();
end;
$$ language plpgsql security definer;
