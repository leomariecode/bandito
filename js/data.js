/* Données : vocabulaire de base, verbes, rappels de conjugaison.
   Pour ajouter une fiche photo : ajouter des entrées dans VOCAB avec un nouvel id et un nom de liste.
   cat = nature du mot (verb, noun, adj, other, expr) : sert à proposer des QCM de même nature. */

const VOCAB = [
  // ---- Espagnol 1 (fiche recto) ----
  { id: 'e1-01', cat: 'expr', list: 'Espagnol 1', es: 'vale', fr: "d'accord", frAlt: 'ok / ça marche' },
  { id: 'e1-02', cat: 'verb', list: 'Espagnol 1', es: 'entender', fr: 'comprendre', esAlt: 'comprender', note: 'Verbe à diphtongue : entiendo, entiendes…' },
  { id: 'e1-03', cat: 'other', list: 'Espagnol 1', es: 'porque', fr: 'parce que', frAlt: 'car', note: 'En un mot. « ¿Por qué? » (deux mots, accent) = pourquoi ?' },
  { id: 'e1-04', cat: 'verb', list: 'Espagnol 1', es: 'recordar', fr: 'se souvenir', frAlt: 'se rappeler / rappeler / souvenir', esAlt: 'acordarse', note: 'Verbe à diphtongue : recuerdo, recuerdas…' },
  { id: 'e1-05', cat: 'expr', list: 'Espagnol 1', es: '¿Qué significa?', fr: 'Que veut dire… ?', frAlt: "qu'est-ce que ça veut dire / que veut dire / que signifie / ça veut dire quoi / qu'est-ce que ça signifie", esAlt: 'qué quiere decir' },
  { id: 'e1-06', cat: 'adj', list: 'Espagnol 1', es: 'desarrollado/a', fr: 'développé(e)', note: 'Participe passé de « desarrollar » (développer).' },
  { id: 'e1-07', cat: 'verb', list: 'Espagnol 1', es: 'desarrollar', fr: 'développer' },
  { id: 'e1-08', cat: 'noun', list: 'Espagnol 1', es: 'el pueblo', fr: 'le peuple / le village' },
  { id: 'e1-09', cat: 'adj', list: 'Espagnol 1', es: 'abierto/a', fr: 'ouvert(e)', note: 'Participe passé irrégulier de « abrir ».' },
  { id: 'e1-10', cat: 'verb', list: 'Espagnol 1', es: 'abrir', fr: 'ouvrir' },
  { id: 'e1-11', cat: 'noun', list: 'Espagnol 1', es: 'los isleños', fr: "les habitants de l'île / les insulaires", frAlt: "habitant de l'île / insulaire / habitants de l'ile / habitant de l'ile", esAlt: 'isleño', note: 'De « la isla » (l\'île).' },
  { id: 'e1-12', cat: 'noun', list: 'Espagnol 1', es: 'la gente', fr: 'les gens', note: 'Toujours au singulier en espagnol : la gente es simpática.' },
  { id: 'e1-13', cat: 'other', list: 'Espagnol 1', es: 'donde', fr: 'où', note: 'Avec accent dans une question : ¿Dónde estás?' },
  { id: 'e1-14', cat: 'noun', list: 'Espagnol 1', es: 'la fe', fr: 'la foi' },
  { id: 'e1-15', cat: 'other', list: 'Espagnol 1', es: 'aquí', fr: 'ici' },
  { id: 'e1-16', cat: 'verb', list: 'Espagnol 1', es: 'querer', fr: 'vouloir / aimer', note: 'Te quiero = je t\'aime. Quiero un café = je veux un café.' },
  { id: 'e1-17', cat: 'noun', list: 'Espagnol 1', es: 'la bandera', fr: 'le drapeau' },
  { id: 'e1-18', cat: 'adj', list: 'Espagnol 1', es: 'rojo/a', fr: 'rouge' },
  { id: 'e1-19', cat: 'adj', list: 'Espagnol 1', es: 'azul', fr: 'bleu' },
  { id: 'e1-20', cat: 'adj', list: 'Espagnol 1', es: 'blanco/a', fr: 'blanc', frAlt: 'blanche' },
  { id: 'e1-21', cat: 'noun', list: 'Espagnol 1', es: 'el faro', fr: 'le phare' },
  { id: 'e1-22', cat: 'noun', list: 'Espagnol 1', es: 'la cruz', fr: 'la croix' },
  { id: 'e1-23', cat: 'expr', list: 'Espagnol 1', es: 'debido a', fr: 'en raison de', frAlt: 'à cause de / dû à', esAlt: 'debido' },
  { id: 'e1-24', cat: 'noun', list: 'Espagnol 1', es: 'el abuelo', fr: 'le grand-père', frAlt: 'grand père / papi / papy' },
  { id: 'e1-25', cat: 'noun', list: 'Espagnol 1', es: 'la abuela', fr: 'la grand-mère', frAlt: 'grand mère / mamie / mamy' },
  { id: 'e1-26', cat: 'other', list: 'Espagnol 1', es: 'todos', fr: 'tous', frAlt: 'tout le monde' },
  { id: 'e1-27', cat: 'other', list: 'Espagnol 1', es: 'hoy', fr: "aujourd'hui" },
  { id: 'e1-28', cat: 'expr', list: 'Espagnol 1', es: 'no sé', fr: 'je ne sais pas', frAlt: 'je sais pas', note: '« sé » vient de « saber » (savoir).' },
  { id: 'e1-29', cat: 'noun', list: 'Espagnol 1', es: 'las flores', fr: 'les fleurs', esAlt: 'flor', frAlt: 'fleur', note: 'Singulier : la flor.' },
  // ---- Espagnol 1 (fiche verso) ----
  { id: 'e1-30', cat: 'noun', list: 'Espagnol 1', es: 'el globo', fr: 'le ballon', note: 'Ballon de baudruche / montgolfière. Aussi : le globe.' },
  { id: 'e1-31', cat: 'adj', list: 'Espagnol 1', es: 'amarillo/a', fr: 'jaune' },
  { id: 'e1-32', cat: 'noun', list: 'Espagnol 1', es: 'un coche', fr: 'une voiture', note: 'Masculin en espagnol.' },
  { id: 'e1-33', cat: 'noun', list: 'Espagnol 1', es: 'un zapato', fr: 'une chaussure', note: 'Masculin en espagnol.' },
  { id: 'e1-34', cat: 'noun', list: 'Espagnol 1', es: 'un cuaderno', fr: 'un cahier' },
  { id: 'e1-35', cat: 'noun', list: 'Espagnol 1', es: 'una hoja', fr: 'une feuille' },
  { id: 'e1-36', cat: 'noun', list: 'Espagnol 1', es: 'un pez', fr: 'un poisson', note: 'Le poisson vivant. Dans l\'assiette : el pescado.' },
  { id: 'e1-37', cat: 'noun', list: 'Espagnol 1', es: 'un calcetín', fr: 'une chaussette', note: 'Masculin en espagnol.' },
  { id: 'e1-38', cat: 'noun', list: 'Espagnol 1', es: 'una chaqueta', fr: 'une veste' },
  { id: 'e1-39', cat: 'other', list: 'Espagnol 1', es: 'ninguno/a', fr: 'aucun', frAlt: 'aucune' },
  { id: 'e1-40', cat: 'adj', list: 'Espagnol 1', es: 'caro/a', fr: 'cher', frAlt: 'chère' },
  { id: 'e1-41', cat: 'adj', list: 'Espagnol 1', es: 'cómodo/a', fr: 'confortable' },
  { id: 'e1-42', cat: 'adj', list: 'Espagnol 1', es: 'barato/a', fr: 'bon marché / pas cher', frAlt: 'moins cher' },
];

const PERSONS = ['yo', 'tú', 'él / ella / usted', 'nosotros/as', 'vosotros/as', 'ellos / ellas / ustedes'];
const PERSONS_FR = ['je', 'tu', 'il / elle / vous (poli)', 'nous', 'vous (pluriel)', 'ils / elles / vous (poli, pluriel)'];

const TENSES = {
  presente: { key: 'presente', name: 'Présent', es: 'presente de indicativo' },
  indefinido: { key: 'indefinido', name: 'Passé simple', es: 'pretérito indefinido' },
  futuro: { key: 'futuro', name: 'Futur simple', es: 'futuro simple' },
};

const ENDINGS = {
  presente: {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  indefinido: {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
  futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'], // ajoutées à l'infinitif entier
};

/* Verbes. Pour chaque temps, une forme explicite = irrégulier dans ce temps.
   futuro peut être un radical irrégulier (chaîne) : 'tendr' -> tendré, tendrás… */
const VERBS = [
  // Réguliers -ar
  { inf: 'hablar', fr: 'parler' },
  { inf: 'trabajar', fr: 'travailler' },
  { inf: 'estudiar', fr: 'étudier' },
  { inf: 'comprar', fr: 'acheter' },
  { inf: 'escuchar', fr: 'écouter' },
  { inf: 'mirar', fr: 'regarder' },
  { inf: 'cantar', fr: 'chanter' },
  { inf: 'viajar', fr: 'voyager' },
  { inf: 'desarrollar', fr: 'développer' },
  // Réguliers -er
  { inf: 'comer', fr: 'manger' },
  { inf: 'beber', fr: 'boire' },
  { inf: 'aprender', fr: 'apprendre' },
  { inf: 'comprender', fr: 'comprendre' },
  { inf: 'correr', fr: 'courir' },
  { inf: 'vender', fr: 'vendre' },
  // Réguliers -ir
  { inf: 'vivir', fr: 'vivre / habiter' },
  { inf: 'escribir', fr: 'écrire' },
  { inf: 'abrir', fr: 'ouvrir' },
  { inf: 'recibir', fr: 'recevoir' },
  { inf: 'subir', fr: 'monter' },
  { inf: 'decidir', fr: 'décider' },
  // Irréguliers courants
  { inf: 'ser', fr: 'être (identité, caractéristique)',
    presente: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
    indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'] },
  { inf: 'estar', fr: 'être (lieu, état)',
    presente: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
    indefinido: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'] },
  { inf: 'tener', fr: 'avoir (posséder)',
    presente: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
    indefinido: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
    futuro: 'tendr' },
  { inf: 'ir', fr: 'aller',
    presente: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
    indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'] },
  { inf: 'hacer', fr: 'faire',
    presente: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
    indefinido: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
    futuro: 'har' },
  { inf: 'poder', fr: 'pouvoir',
    presente: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
    indefinido: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
    futuro: 'podr' },
  { inf: 'querer', fr: 'vouloir / aimer',
    presente: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
    indefinido: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron'],
    futuro: 'querr' },
  { inf: 'decir', fr: 'dire',
    presente: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
    indefinido: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
    futuro: 'dir' },
  { inf: 'venir', fr: 'venir',
    presente: ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
    indefinido: ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron'],
    futuro: 'vendr' },
  { inf: 'saber', fr: 'savoir',
    presente: ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
    indefinido: ['supe', 'supiste', 'supo', 'supimos', 'supisteis', 'supieron'],
    futuro: 'sabr' },
  { inf: 'dar', fr: 'donner',
    presente: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
    indefinido: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'] },
  { inf: 'ver', fr: 'voir',
    presente: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
    indefinido: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'] },
  { inf: 'poner', fr: 'mettre / poser',
    presente: ['pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen'],
    indefinido: ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron'],
    futuro: 'pondr' },
  { inf: 'salir', fr: 'sortir / partir',
    presente: ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'],
    futuro: 'saldr' },
  { inf: 'entender', fr: 'comprendre',
    presente: ['entiendo', 'entiendes', 'entiende', 'entendemos', 'entendéis', 'entienden'] },
  { inf: 'recordar', fr: 'se souvenir / rappeler',
    presente: ['recuerdo', 'recuerdas', 'recuerda', 'recordamos', 'recordáis', 'recuerdan'] },
];

/* Rappels de cours. Les jetons {{table:verbe}} et {{irr:verbe,verbe}} sont remplacés
   par des tableaux générés par le moteur de conjugaison (donc toujours cohérents avec les exercices). */
const LESSONS = {
  presente: `
<section class="card">
  <h2>À quoi sert le présent ?</h2>
  <p>Comme en français, il sert à parler de ce qui se passe <strong>maintenant</strong>, d'une <strong>habitude</strong> ou d'une <strong>vérité générale</strong>.</p>
  <ul class="examples">
    <li><span class="es">Hablo español.</span><span class="fr">Je parle espagnol.</span></li>
    <li><span class="es">Comemos a las dos.</span><span class="fr">Nous mangeons à deux heures.</span></li>
    <li><span class="es">Vivo en Francia.</span><span class="fr">J'habite en France.</span></li>
  </ul>
</section>

<section class="card">
  <h2>Les pronoms sujets</h2>
  {{persons}}
  <p class="tip"><strong>Important :</strong> en espagnol on n'écrit presque jamais le pronom, car la terminaison du verbe suffit à dire qui parle. « Hablo » veut déjà dire « je parle ». C'est pour ça que les terminaisons sont si importantes.</p>
</section>

<section class="card">
  <h2>Les verbes réguliers</h2>
  <p>Il y a trois groupes, selon la fin de l'infinitif : <strong>-ar</strong>, <strong>-er</strong>, <strong>-ir</strong>. La méthode est toujours la même :</p>
  <ol>
    <li>On enlève la terminaison de l'infinitif : <span class="es">habl<del>ar</del></span> → <span class="es">habl-</span></li>
    <li>On ajoute la terminaison de la personne.</li>
  </ol>
  {{table:hablar,comer,vivir}}
  <p class="tip"><strong>Pour retenir :</strong></p>
  <ul>
    <li><span class="es">yo</span> finit toujours par <strong>-o</strong>, dans les trois groupes.</li>
    <li>Les verbes en <strong>-ar</strong> ont un <strong>a</strong> partout ailleurs ; ceux en <strong>-er</strong> ont un <strong>e</strong>.</li>
    <li>Les verbes en <strong>-ir</strong> se conjuguent comme ceux en -er, <strong>sauf</strong> à nosotros (<strong>-imos</strong>) et vosotros (<strong>-ís</strong>).</li>
    <li>Le seul accent écrit est à <span class="es">vosotros</span> : -áis, -éis, -ís.</li>
  </ul>
</section>

<section class="card">
  <h2>Les irréguliers indispensables</h2>
  <p>Ce sont les verbes les plus utilisés de la langue : il faut les connaître par cœur.</p>
  {{table:ser,estar,tener,ir}}
  <p class="tip"><strong>Ser ou estar ?</strong> Les deux veulent dire « être ». <span class="es">Ser</span> = ce qu'on est (identité, nationalité, métier, caractère) : <span class="es">Soy francés.</span> <span class="es">Estar</span> = où on est et comment on va (lieu, état passager) : <span class="es">Estoy en casa. Estoy cansado.</span></p>
  <h3>Irréguliers seulement à « yo »</h3>
  <p>Ces verbes sont réguliers partout sauf à la première personne :</p>
  {{yo:hacer,poner,salir,saber,dar,ver}}
  <h3>Verbes à diphtongue</h3>
  <p>La voyelle du radical se transforme (<strong>e → ie</strong>, <strong>o → ue</strong>) à toutes les personnes <strong>sauf nosotros et vosotros</strong>. Les terminaisons, elles, restent régulières.</p>
  {{table:querer,poder,entender,recordar}}
  <h3>Les autres</h3>
  {{table:decir,venir}}
</section>`,

  indefinido: `
<section class="card">
  <h2>À quoi sert le passé simple ?</h2>
  <p>Le <em>pretérito indefinido</em> raconte une action <strong>terminée</strong>, à un moment <strong>précis</strong> du passé. Contrairement au passé simple français, il s'emploie tout le temps, y compris à l'oral : il correspond le plus souvent à notre <strong>passé composé</strong>.</p>
  <ul class="examples">
    <li><span class="es">Ayer comí paella.</span><span class="fr">Hier j'ai mangé de la paella.</span></li>
    <li><span class="es">El año pasado viajamos a México.</span><span class="fr">L'année dernière nous avons voyagé au Mexique.</span></li>
    <li><span class="es">Nació en 1990.</span><span class="fr">Il est né en 1990.</span></li>
  </ul>
  <p class="tip"><strong>Mots qui l'annoncent :</strong> <span class="es">ayer</span> (hier), <span class="es">anoche</span> (hier soir), <span class="es">la semana pasada</span> (la semaine dernière), <span class="es">el año pasado</span> (l'année dernière), <span class="es">hace dos días</span> (il y a deux jours), <span class="es">en 2020</span>.</p>
</section>

<section class="card">
  <h2>Les verbes réguliers</h2>
  <p>On enlève -ar / -er / -ir et on ajoute les terminaisons. Bonne nouvelle : les verbes en <strong>-er et -ir ont exactement les mêmes terminaisons</strong>, il n'y a donc que deux séries à apprendre.</p>
  {{table:hablar,comer,vivir}}
  <p class="tip"><strong>Pour retenir :</strong></p>
  <ul>
    <li>Il y a un <strong>accent écrit à yo et à él</strong> : <span class="es">hablé, habló</span> — <span class="es">comí, comió</span>.</li>
    <li>Cet accent change le sens : <span class="es">hablo</span> = je parle (présent), <span class="es">habló</span> = il a parlé (passé).</li>
    <li>À <span class="es">nosotros</span>, les verbes en -ar et -ir ont la même forme qu'au présent : <span class="es">hablamos, vivimos</span>. C'est le contexte qui fait la différence.</li>
    <li><span class="es">tú</span> finit par <strong>-ste</strong>, sans « s » final : <span class="es">hablaste</span>, jamais « hablastes ».</li>
  </ul>
</section>

<section class="card">
  <h2>Les irréguliers indispensables</h2>
  <h3>Ser et ir : la même conjugaison</h3>
  <p><span class="es">Fui</span> veut dire « je fus / j'ai été » ou « j'allai / je suis allé » : c'est le contexte qui tranche. <span class="es">Fui a Madrid</span> = je suis allé à Madrid.</p>
  {{table:ser,ir}}
  <h3>Les radicaux irréguliers</h3>
  <p>Beaucoup de verbes courants changent de radical et prennent une série de terminaisons spéciale, <strong>sans aucun accent</strong> : <strong>-e, -iste, -o, -imos, -isteis, -ieron</strong>.</p>
  {{table:tener,estar,poder,poner}}
  {{table:saber,querer,venir,hacer}}
  <p class="tip"><strong>Attention :</strong> <span class="es">hacer</span> → <span class="es">hi<strong>z</strong>o</span> à él (avec un z, pour garder le son). <span class="es">decir</span> → <span class="es">dijeron</span> (pas de « i » après le j).</p>
  {{table:decir,dar,ver}}
  <p class="tip"><span class="es">Dar</span> et <span class="es">ver</span> prennent les terminaisons des verbes en -er/-ir, mais <strong>sans accent</strong> : <span class="es">di, dio — vi, vio</span>.</p>
</section>`,

  futuro: `
<section class="card">
  <h2>À quoi sert le futur simple ?</h2>
  <p>Il sert à parler de ce qui <strong>se passera</strong> : projets, prévisions, promesses.</p>
  <ul class="examples">
    <li><span class="es">Mañana trabajaré en casa.</span><span class="fr">Demain je travaillerai à la maison.</span></li>
    <li><span class="es">Viviremos en España.</span><span class="fr">Nous vivrons en Espagne.</span></li>
    <li><span class="es">¿Vendrás a la fiesta?</span><span class="fr">Tu viendras à la fête ?</span></li>
  </ul>
  <p class="tip"><strong>Mots qui l'annoncent :</strong> <span class="es">mañana</span> (demain), <span class="es">luego</span> (plus tard), <span class="es">la semana que viene</span> (la semaine prochaine), <span class="es">el año próximo</span> (l'année prochaine).</p>
  <p class="tip"><strong>Le futur proche</strong> existe aussi, comme en français : <span class="es">ir a + infinitif</span>. <span class="es">Voy a comer</span> = je vais manger. Il est très courant à l'oral.</p>
</section>

<section class="card">
  <h2>Les verbes réguliers</h2>
  <p>C'est le temps le plus simple : on garde <strong>l'infinitif en entier</strong> et on ajoute les mêmes terminaisons pour les trois groupes : <strong>-é, -ás, -á, -emos, -éis, -án</strong>.</p>
  <p>C'est le même principe qu'en français : <em>parler</em> + <em>ai</em> → je parlerai ; <span class="es">hablar + é → hablaré</span>.</p>
  {{table:hablar,comer,vivir}}
  <p class="tip"><strong>Pour retenir :</strong></p>
  <ul>
    <li><strong>Accent écrit partout sauf à nosotros</strong> : <span class="es">hablaré, hablarás, hablará, hablaremos, hablaréis, hablarán</span>.</li>
    <li>La voix appuie toujours sur la terminaison, jamais sur le radical.</li>
    <li><span class="es">Ser, estar, ir, dar, ver</span> sont <strong>réguliers</strong> au futur : <span class="es">seré, estaré, iré, daré, veré</span>.</li>
  </ul>
</section>

<section class="card">
  <h2>Les irréguliers indispensables</h2>
  <p>Seul le <strong>radical</strong> change ; les terminaisons restent les mêmes. Il suffit donc de retenir le radical. Beaucoup ressemblent au français (<em>tiendr-</em>, <em>viendr-</em>, <em>pourr-</em>…).</p>
  {{stems:tener,poner,salir,venir,poder,saber,querer,hacer,decir}}
  {{table:tener,hacer,decir,poder}}
</section>`,
};
