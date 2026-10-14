-- Keep historical English and Coloring rows; new navigation uses the eight requested subjects.
insert into public.categories(slug,name,description,sort_order) values
('reading','Reading','Reading comprehension, fluency and phonics',2),
('kindergarten','Kindergarten','Early learning and school readiness',3),
('vocabulary','Vocabulary','Word meanings, synonyms and context',4),
('spelling','Spelling','Spelling patterns and word building',5),
('grammar','Grammar','Parts of speech, sentences and punctuation',6),
('writing','Writing','Handwriting, composition and prompts',7),
('colors','Colors','Color recognition and creative activity',8)
on conflict(slug) do update set name=excluded.name,description=excluded.description,sort_order=excluded.sort_order;
update public.categories set name='Math',sort_order=1 where slug='math';
insert into public.grades(slug,display_name,sort_order,age_min,age_max) values
('grade-4','Grade 4',6,9,10),('grade-5','Grade 5',7,10,11),('grade-6','Grade 6',8,11,12)
on conflict(slug) do update set display_name=excluded.display_name,sort_order=excluded.sort_order,age_min=excluded.age_min,age_max=excluded.age_max;
