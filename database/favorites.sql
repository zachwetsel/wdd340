CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES inventory(inv_id) ON DELETE CASCADE,
    UNIQUE(account_id, item_id)
)