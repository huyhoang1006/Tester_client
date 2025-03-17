export const createOwner = (db) => {
    return new Promise((resolve, reject) => {
        db.run("CREATE TABLE owner(id text PRIMARY KEY NOT NULL, user_id text, name text, address text, city text, state text, country text, phone_no text, mode text, ref_id text, " +
            "fax text, email text, name_person text, phone1 text,phone2 text, fax_contact text, email_contact text, department text, position text, comment text)", (err, row) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}