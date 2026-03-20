// ─── Sample Book Data for MVP Demo ───────────────────────────
// These are original summaries/retellings for demo purposes.

export interface BookData {
  id: string;
  title: string;
  author: string;
  description: string;
  coverGradient: [string, string];
  totalPages: number;
  chapters: Array<{ number: number; title: string; startPage: number; endPage: number }>;
  pages: Record<number, string>;
}

export const SAMPLE_BOOKS: BookData[] = [
  {
    id: "charlie-chocolate-factory",
    title: "Charlie and the Chocolate Factory",
    author: "Roald Dahl",
    description:
      "Young Charlie Bucket wins a golden ticket to visit the world's most extraordinary chocolate factory, run by the eccentric and brilliant Willy Wonka.",
    coverGradient: ["#8B4513", "#D2691E"],
    totalPages: 12,
    chapters: [
      { number: 1, title: "Here Comes Charlie", startPage: 1, endPage: 4 },
      { number: 2, title: "The Golden Tickets", startPage: 5, endPage: 8 },
      { number: 3, title: "The Factory", startPage: 9, endPage: 12 },
    ],
    pages: {
      1: `Charlie Bucket lived in a small wooden house on the edge of a great town. The house wasn't nearly large enough for so many people, and life was extremely uncomfortable. There were only two rooms and one bed, and the entire family shared everything they had.

The family was poor — desperately poor. Mr. Bucket was the only person in the family with a job. He worked in a toothpaste factory, where he sat all day long at a bench and screwed the little caps on to the tops of the tubes of toothpaste after they had been filled. But a toothpaste cap-screwer is never paid very much, so there was never enough money to buy proper food for the whole family.

The only meals they could afford were bread and margarine for breakfast, boiled potatoes and cabbage for lunch, and cabbage soup for supper. Sundays were a little bit better. They all looked forward to Sundays because then, although they had exactly the same food, everyone was allowed a second helping.

Charlie felt the hunger most keenly. And the thing that tortured him above all else was chocolate.`,

      2: `Walking to school in the mornings, Charlie could see great slabs of chocolate piled up high in the shop windows, and he would stop and stare and press his nose against the glass, his mouth watering. Several times a day, he would see other children pulling creamy candy bars out of their pockets and munching them greedily, and that was pure torture.

Only once a year, on his birthday, did Charlie Bucket ever get to taste a bit of chocolate. The whole family saved up their money for that special occasion, and when the great day arrived, Charlie was always presented with one small chocolate bar to eat all by himself.

He would place it carefully in a small wooden box that he owned, and treasure it as though it were a bar of solid gold. For the next few days, he would only allow himself to look at it, but never to touch it. Then at last, when he could stand it no longer, he would peel back a tiny bit of the wrapping paper at one corner to expose a tiny bit of chocolate, and then he would take a tiny nibble — just enough to allow the lovely sweet taste to spread out slowly over his tongue.

And every night, grandparents would tell Charlie stories about the mysterious Mr. Willy Wonka, the greatest chocolatier the world had ever seen.`,

      3: `"Mr. Willy Wonka can make marshmallows that taste of violets," Grandpa Joe whispered, his eyes shining with excitement. "And rich caramels that change color every ten seconds as you suck them. And little feathery sweets that melt the moment you put them between your lips."

"He can make chewing gum that never loses its taste! And sugar balloons that you can blow up to enormous sizes before you pop them with a pin and gobble them up!"

"But even more wonderful still," continued Grandpa Joe, raising himself up on his pillow to bring his mouth close to Charlie's ear, "Mr. Wonka can make birds' eggs that are speckled and when you put them in your mouth the chocolate gradually becomes smaller and the little sugary baby bird inside starts to move, and suddenly it hops out!"

Charlie listened in wonder. The old man's stories about Wonka's factory were the most exciting things he had ever heard. He dreamed of chocolate rivers, of candy meadows, and of a man who could create miracles from sugar and cocoa.`,

      4: `But then one day, everything changed. Mr. Wonka sent a notice 'round the world: he had hidden five Golden Tickets, one each inside five ordinary chocolate bars. The five lucky finders of these Golden Tickets would be allowed to visit his factory, and at the end of the tour, they would each be given enough chocolate and candy to last them a lifetime.

"Just imagine!" cried Grandpa Joe, clutching Charlie's hand. "Someone is going to find the first Golden Ticket any day now, you mark my words!"

The whole world went crazy with excitement. Everywhere people were buying Wonka chocolate bars and tearing off the wrappers, desperately searching for the precious Golden Ticket. Rich men's wives were buying hundreds of bars at a time. In factories, workers were leaving their jobs to spend all day searching.

Charlie watched it all from afar, knowing he could not afford more than his single birthday bar. Yet somehow, deep in his heart, there was a small stubborn flame — a belief that maybe, just maybe, the magic might find its way to him.`,

      5: `The first Golden Ticket was found by a boy named Augustus Gloop, an enormously fat child whose hobby was eating. He was so fat that his face looked like a ball of dough with two small greedy curranty eyes peering out of it. His town celebrated, and Augustus appeared on television, chocolate smeared across his chin, declaring that he ate at least fifty bars a day.

The second ticket was found by a small girl called Veruca Salt, whose father owned a peanut factory. He had bought half a million Wonka bars and set every one of his workers to shelling the wrappers until they found it. Veruca was a spoiled brat who always got what she wanted.

The third ticket went to Violet Beauregarde, a world-champion gum chewer who had been working on the same piece of gum for three months solid. She was loud, boastful, and cared about nothing except her chewing record.

The fourth ticket was claimed by Mike Teavee, a boy obsessed with television who watched it all day long and cared for nothing else. He was rude and arrogant, and sneered at everyone around him.

Only one Golden Ticket remained.`,

      6: `Charlie walked home slowly that evening, hands deep in his pockets, head bowed against the bitter cold. One ticket left. Just one. And millions of chocolate bars still waiting to be opened around the world.

Then, on the icy pavement, he saw something: a single silver coin, half-buried in the snow. A fifty-pence piece! Charlie's heart leaped. He scooped it up, barely believing his luck. His first impulse was to rush to the nearest shop and buy a Wonka bar. But the hunger gnawing at his stomach was real and sharp.

He bought one bar. Just one. And as his frozen fingers fumbled with the wrapper, peeling it back inch by inch — there it was. A flash of brilliant gold.

"It's the last Golden Ticket!" shrieked the shopkeeper. "You've found it!" 

Charlie grabbed the ticket and ran. He ran through the streets as fast as his legs would carry him, burst through the front door, and cried: "I've got it! I've got the fifth Golden Ticket!"

The whole family erupted.`,

      7: `Grandpa Joe leaped out of bed for the first time in twenty years. "Read it!" he cried. "Read what it says!"

Charlie held up the Golden Ticket, and in a trembling voice, he read aloud: "Greetings to you, the lucky finder of this Golden Ticket, from Mr. Willy Wonka! I shake you warmly by the hand! Tremendous things are in store for you! Many wonderful surprises await you! I do invite you to come to my factory and be my guest for one whole day. You may bring one member of your family to look after you."

"It's tomorrow!" gasped Grandpa Joe. "The factory visit is tomorrow!"

That night, Charlie couldn't sleep. He lay in the dark, clutching the Golden Ticket, imagining what wonders awaited behind those great iron gates. The chocolate river, the inventing room, the everlasting gobstoppers — all the things Grandpa Joe had whispered about.

Tomorrow, everything would change.`,

      8: `The next morning dawned cold and bright. Charlie and Grandpa Joe stood before the enormous red iron gates of Wonka's chocolate factory. The other four children were already there: Augustus Gloop licking his lips, Veruca Salt stamping her foot impatiently, Violet Beauregarde chewing furiously, and Mike Teavee looking bored.

The gates swung open, and there stood Willy Wonka himself — a tiny, extraordinary man in a black top hat and a plum-colored velvet tailcoat. His eyes sparkled with wit and mischief.

"Welcome, my dear children! Welcome to my factory!" He clapped his small hands together, beaming at them all. "Please, please, follow me! There is so much to see, so much to taste, so much to do!"

And with that, the most extraordinary day of Charlie's life began.`,

      9: `The Chocolate Room took their breath away. It was a magical valley, with lush green meadows of sugar and a great brown chocolate river flowing through it. Wonka's workers — the tiny Oompa-Loompas from Loompaland — tended the chocolate pipes and candy trees.

"Everything in this room is edible!" Wonka declared, spreading his arms wide. "Even I am edible! But that, dear children, is called cannibalism, and is in fact frowned upon in most societies."

Augustus Gloop was the first to fall. Unable to resist, he knelt by the chocolate river and began scooping great handfuls of warm liquid chocolate into his mouth. Before anyone could stop him, he toppled in and was sucked up one of the great glass pipes.

The Oompa-Loompas began to sing — a strange, catchy song about the terrible consequences of greed and gluttony. Charlie looked on in amazement, unsure whether to laugh, cry, or simply pinch himself to see if he was dreaming.`,

      10: `In the Inventing Room, Wonka showed them his latest creation: a stick of gum that contained an entire three-course dinner. Violet Beauregarde grabbed it against Wonka's warnings and began to chew. She swelled up like a blueberry and had to be rolled away to the Juicing Room.

Then came the Nut Room, where one hundred squirrels sat on stools, shelling walnuts. Veruca Salt demanded that her father buy her one of the squirrels. When he refused, she marched in herself. The squirrels, quick as a flash, grabbed her and threw her down the garbage chute — she was a "bad nut."

In the Television Room, Mike Teavee couldn't resist the television chocolate machine and zapped himself into a million tiny pieces, shrinking to the size of a finger.

One by one, the children disappeared. Only Charlie remained. Quiet, modest, well-behaved Charlie.`,

      11: `"But Charlie — my dear boy," said Wonka, suddenly stopping and turning. His voice had become soft and serious. "Do you know what happened to all those other children?"

Charlie nodded slowly.

"They were all terrible children. Selfish, spoiled, greedy, and rude. But you, Charlie — you were different." Wonka's eyes glistened. "You never complained. You never demanded. You were kind and curious and good."

They stepped into the great glass elevator — a magical box made entirely of transparent material that could fly in any direction.

"I have a surprise for you, Charlie," Wonka whispered. "This factory — all of it — I'm giving it to you."

Charlie's mouth fell open. He stared at Wonka, unable to speak.

"I need an heir, dear boy. Someone who will love this factory as I do. Someone who understands that the best chocolate is made not with greed, but with wonder and love."`,

      12: `The great glass elevator shot through the roof of the factory and soared into the sky above the town. Charlie could see everything — the factory's smoking chimneys, the tiny houses, the school he would never have to attend as a hungry child again.

"We'll bring your whole family here," said Wonka. "Your mother and father, and all four grandparents. They'll live in the factory, and they'll never be cold or hungry again."

Charlie felt tears rolling down his cheeks. Not tears of sadness, but tears of pure, overwhelming joy. He thought about all those nights lying awake, dreaming of chocolate, dreaming of something magical happening. And now it had.

"Mr. Wonka," Charlie whispered, "thank you."

Wonka smiled — that strange, wonderful smile of his. "No, Charlie. Thank you. You reminded me of something I had almost forgotten."

"What's that?" Charlie asked.

"That the very best things in life are not things at all. They are kindnesses, and wonder, and love."

The elevator sailed on into the golden sunset, carrying a boy, an old man, and a universe of dreams yet to come.`,
    },
  },
  {
    id: "harry-potter-philosophers-stone",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description:
      "An orphaned boy discovers he is a wizard and begins his education at Hogwarts School of Witchcraft and Wizardry, where danger and destiny await.",
    coverGradient: ["#1a1a2e", "#e94560"],
    totalPages: 12,
    chapters: [
      { number: 1, title: "The Boy Who Lived", startPage: 1, endPage: 4 },
      { number: 2, title: "Letters from No One", startPage: 5, endPage: 8 },
      { number: 3, title: "The Journey to Hogwarts", startPage: 9, endPage: 12 },
    ],
    pages: {
      1: `The Dursleys of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.

Mr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, and a very large moustache. Mrs. Dursley was thin, blonde, and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.

They had a small son called Dudley, and in their opinion there was no finer boy anywhere. The Dursleys had everything they wanted, but they also had a secret — and their greatest fear was that somebody would discover it.

Mrs. Dursley's sister was as different from her as it was possible to be. The Dursleys shuddered to think what the neighbors would say if the Potters arrived in their street.`,

      2: `On the evening that our story begins, Mr. Dursley noticed several strange things on his way to work. There were people in cloaks everywhere, whispering excitedly. He saw a cat reading a map on the corner of his street. And on the news that night, the weatherman mentioned that owls had been seen flying during the day all over the country.

That night, an old man appeared at the end of Privet Drive. He was tall, thin, and very old — with silver hair and a beard long enough to tuck into his belt. He wore half-moon spectacles and long purple robes. His name was Albus Dumbledore.

He took out a silver device — a Put-Outer — and clicked it. The street lamps went out, one by one, plunging the street into darkness. He was waiting for someone.

A tabby cat that had been sitting on the garden wall all day transformed into a tall, stern-looking woman in emerald robes. "Fancy seeing you here, Professor McGonagall," said Dumbledore.`,

      3: `"Is it true, Dumbledore?" Professor McGonagall asked, her voice trembling. "They're saying that the Potters — James and Lily — that they're... dead."

Dumbledore bowed his head. "I'm afraid so."

"And the boy? Harry? They're saying that when the Dark Lord tried to kill him too, he couldn't. That somehow, the curse bounced back and destroyed You-Know-Who himself."

"That is what we believe happened, yes."

They spoke in hushed tones about the terrible events — how the most dangerous dark wizard of all time, Lord Voldemort, had gone to the Potters' home and murdered James and Lily Potter. But when he had turned his wand on their one-year-old son, Harry, something impossible had happened. The killing curse had rebounded, destroying Voldemort, and leaving the baby with nothing but a lightning-bolt-shaped scar on his forehead.

The child had survived. The Boy Who Lived.`,

      4: `A great rumbling sound shattered the silence of Privet Drive, and an enormous motorcycle descended from the sky. Riding it was a giant of a man — Rubeus Hagrid, Keeper of Keys and Grounds at Hogwarts. In his vast arms, wrapped in blankets, was a baby boy, fast asleep.

"Is that where —?" whispered Professor McGonagall. "Dumbledore, you can't leave him here. These people are the worst sort of Muggles imaginable —"

"It's the best place for him," Dumbledore said firmly. "His aunt and uncle will be able to explain everything when he's older. I've written them a letter."

He placed the sleeping baby gently on the doorstep of number four, Privet Drive, tucked the letter into his blankets, and stepped back.

For a long moment, the three of them stood looking at the small bundle. Then Dumbledore turned and walked away, clicking the Put-Outer until every lamp flickered back to life.

"Good luck, Harry," he murmured. And the boy who had defeated the darkest wizard of the age slept on, not knowing that he was famous, not knowing that he was special, not knowing that in cupboards and attics all over the country, people were raising their glasses and whispering: "To Harry Potter — the boy who lived!"`,

      5: `Nearly ten years had passed since the Dursleys had woken up to find their nephew on the front step. Privet Drive had hardly changed at all. Only the photographs on the mantelpiece showed how much time had gone by — photos of a large blond boy on various rides, at various birthday parties, but no sign of another boy living there.

Yet Harry Potter was still there, asleep in a cupboard under the stairs. He had lived there as long as he could remember — ever since his aunt and uncle had taken him in after his parents died in a car crash. At least, that's what they told him.

Harry was small and skinny for his age, with bright green eyes and jet-black hair that stuck up in every direction. He wore round glasses held together with tape. The only thing he liked about his own appearance was a thin scar on his forehead, shaped like a lightning bolt.

Strange things always seemed to happen around Harry. His teacher's wig had once turned blue. He had somehow ended up on the school roof when running from bullies. He had once set a boa constrictor on his cousin Dudley at the zoo — though he hadn't meant to.`,

      6: `On his eleventh birthday — a day the Dursleys ignored entirely — Harry received a letter. It was addressed in emerald-green ink to: Mr. H. Potter, The Cupboard under the Stairs, 4 Privet Drive.

Uncle Vernon snatched it away before Harry could read it, his face turning purple with rage. More letters came the next day. And the next. Dozens of them. Hundreds. They came through the mail slot, squeezed under the door, pushed through the windows.

Uncle Vernon boarded up the mail slot. He nailed the windows shut. He moved Harry to Dudley's second bedroom. But the letters kept coming — tucked inside eggs, flying down the chimney, slipping through every crack. The Dursleys were losing their minds.

Finally, in a desperate bid to escape the letters, Uncle Vernon drove the family to a desolate shack on a tiny rock in the middle of the sea. "No one can reach us here," he declared triumphantly.

That night, as a terrible storm raged outside and Harry lay on the cold floor counting down the minutes to midnight — to his eleventh birthday — there came a knock at the door.`,

      7: `BOOM. The door flew off its hinges, and standing in the doorway was the most enormous man Harry had ever seen. He was almost twice as tall as a normal man and at least five times as wide, with a wild mane of black hair and a beard that covered most of his face.

"Sorry 'bout that," said the giant, picking up the door and setting it back in place. He looked down at Harry, and his beetle-black eyes crinkled with warmth.

"Harry! Las' time I saw you, you was only a baby. Yeh look a lot like yer dad, but yeh've got yer mum's eyes."

"I'm sorry — who are you?" Harry stammered.

"Rubeus Hagrid, Keeper of Keys and Grounds at Hogwarts. Yeh'll know all abou' Hogwarts, o' course."

"I'm sorry — I don't."

Hagrid looked thunderstruck. He turned to the Dursleys, his face dark with fury. "Do you mean ter tell me that this boy — this boy! — knows nothin' abou' ANYTHING?"

He sat down heavily, pulled out a slightly squashed birthday cake, and said the words that changed everything:

"Harry — yer a wizard."`,

      8: `Harry stared. "I'm a what?"

"A wizard. And a thumpin' good one, I'd say, once yeh've been trained up a bit. Yer mum and dad — they were the finest witch and wizard of their age. Head Boy and Girl at Hogwarts."

And then Hagrid told him the truth. Not the car-crash story the Dursleys had always told. The real truth: that his parents had been murdered by a dark wizard called Voldemort, the most powerful dark wizard in a hundred years. That Voldemort had tried to kill Harry too, but something had gone wrong. The curse had bounced back. And Voldemort had vanished.

"You're famous, Harry. Everyone in our world knows who you are. You're the Boy Who Lived."

Harry looked at Hagrid, then at the letter in his hands — the acceptance letter to Hogwarts School of Witchcraft and Wizardry — and felt something stirring inside him that he had never felt before.

Hope. Belonging. The sense that somewhere out there was a place where he wouldn't be the odd one out — where magic was real, and he was not a freak, but someone extraordinary.`,

      9: `On September the first, Harry stood on Platform Nine at King's Cross station, staring at his ticket in confusion. It read: "Platform Nine and Three-Quarters." He was about to give up when he spotted a family of redheads — the Weasleys — and their mother showed him the secret: walk straight at the brick wall between platforms nine and ten.

Harry closed his eyes, pushed his trolley forward, and suddenly he was through. Before him stood a scarlet steam engine: the Hogwarts Express. Steam billowed across a platform packed with students, families, owls, and magic.

On the train, Harry met Ron Weasley — a tall, gangly, freckled boy with a hand-me-down rat and sandwiches he didn't much like. They bonded instantly over Chocolate Frogs and Bertie Bott's Every Flavour Beans.

"Are all your family wizards?" Harry asked.

"Er — yes, I think so," said Ron. "Mum's got a second cousin who's an accountant, but we never talk about him."

They also met Hermione Granger — a bushy-haired, bossy girl who had already memorized all her textbooks. "I've read about you, of course," she told Harry earnestly. "You're in Modern Magical History and The Rise and Fall of the Dark Arts."`,

      10: `The great castle of Hogwarts rose from the darkness like a dream — a vast, magnificent structure of towers and turrets, its windows twinkling with a thousand lights reflected in the dark lake below.

"No more'n four to a boat!" Hagrid called, and the first-years climbed into little boats that glided silently across the lake toward the castle.

Inside, they were led to the Great Hall — a vast, enchanted room with a ceiling that looked exactly like the night sky, dotted with floating candles. Four long tables stretched the length of the hall, filled with older students. At the front, the teachers sat behind a high table.

Professor McGonagall placed an ancient, battered hat on a stool. The Sorting Hat. It sang a song about the four houses — brave Gryffindor, loyal Hufflepuff, wise Ravenclaw, and cunning Slytherin.

"When I call your name, you will sit on the stool," said McGonagall, "and the hat will sort you into your houses."

Harry's stomach twisted with nerves. When his name was called, the hall went silent. Everyone craned to look. The hat was placed on his head, and a small voice whispered in his ear: "Difficult. Very difficult. But I know just what to do with you — GRYFFINDOR!"`,

      11: `Life at Hogwarts was unlike anything Harry had ever experienced. The staircases moved. The portraits talked and visited each other's frames. Ghosts drifted through walls during dinner. And every day brought new magic to learn.

In Transfiguration, Professor McGonagall turned her desk into a pig and back again. In Charms, tiny Professor Flitwick taught them to make objects fly. Herbology meant wrestling with magical plants, and History of Magic was so boring that even the teacher — a ghost — seemed to have died of boredom.

But the class Harry dreaded most was Potions, taught by Professor Snape. From the very first lesson, it was clear that Snape despised Harry — his black eyes full of cold dislike, his questions designed to humiliate. There was something unsettling about Snape, something that made the scar on Harry's forehead prickle.

Harry also discovered Quidditch — a magical sport played on broomsticks — and found that he was a natural. He became the youngest Seeker in a century, soaring through the air with an ease that felt like coming home.

With Ron and Hermione by his side, Harry began to feel something remarkable: he belonged.`,

      12: `But shadows lurked beneath Hogwarts' wonders. A three-headed dog guarded a trapdoor on the forbidden third-floor corridor. Something was hidden in the school — something precious — and someone was trying to steal it.

Through courage, cleverness, and friendship, Harry, Ron, and Hermione fought their way through a series of magical protections: Devil's Snare, enchanted keys, a giant chess game, and a riddle of potions. In the final chamber, Harry faced not Snape, but Professor Quirrell — who had been hiding Voldemort on the back of his head all along.

Voldemort, reduced to a parasitic shadow, wanted the Philosopher's Stone — an object that could grant eternal life. But when Quirrell tried to seize Harry, his skin burned at Harry's touch. The love Harry's mother had given her life to give him — it was a protection Voldemort could not overcome.

Harry awoke in the hospital wing. Dumbledore sat beside him, smiling.

"The Stone has been destroyed," the old wizard said gently. "As for Voldemort — he will try to return. But while you can still call Hogwarts home, you will never truly be alone."

Harry smiled. For the first time in his life, he was going home — and he knew he would return. The adventure was only beginning.`,
    },
  },
];
