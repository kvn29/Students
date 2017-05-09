CREATE SEQUENCE public.files_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;
CREATE TABLE public.files
(
    id integer NOT NULL DEFAULT nextval('files_id_seq'::regclass),
    name text NOT NULL,
    description text NOT NULL
)
WITH (
  OIDS=FALSE
);
CREATE TABLE public.files_activity
(
    id_file integer NOT NULL,
    id_user integer NOT NULL,
    name_user text NOT NULL,
    prenom_user text NOT NULL,
    description_change text NOT NULL,
    date bigint NOT NULL,
    file text
)
WITH (
  OIDS=FALSE
);
CREATE SEQUENCE public.users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;
CREATE TABLE public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    email text NOT NULL,
    password text NOT NULL,
    nom text NOT NULL,
    prenom text NOT NULL,
    id_courses integer NOT NULL,
    dateinscription bigint NOT NULL,
    numeroetudiant bigint
)
WITH (
  OIDS=FALSE
);
