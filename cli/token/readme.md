# JSON Web Token Local Storage

On authentication, the jwt is returned and then stored here on disk, where it is injected into post request header and used to authenticate the ledger route so that a password is not always needed. The timespan of the token can be altered, as can the refresh token timespan.