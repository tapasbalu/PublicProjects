/**
 * iplData.js
 * IPL 2026 team squads scraped from olympics.com.
 * Each player has: name, role (batsman|bowler|allrounder|wicketkeeper), team, country
 */

export const IPL_TEAMS = [
  {
    name: 'Chennai Super Kings',
    short: 'CSK',
    color: '#f9cd05',
    players: [
      { name: 'Ruturaj Gaikwad', role: 'batsman' },
      { name: 'MS Dhoni', role: 'wicketkeeper' },
      { name: 'Dewald Brevis', role: 'batsman' },
      { name: 'Ayush Mhatre', role: 'batsman' },
      { name: 'Sanju Samson', role: 'wicketkeeper' },
      { name: 'Sarfaraz Khan', role: 'batsman' },
      { name: 'Shivam Dube', role: 'allrounder' },
      { name: 'Anshul Kamboj', role: 'allrounder' },
      { name: 'Matthew Short', role: 'allrounder' },
      { name: 'Prashant Veer', role: 'allrounder' },
      { name: 'Ramakrishna Ghosh', role: 'allrounder' },
      { name: 'Zak Foulkes', role: 'allrounder' },
      { name: 'Aman Khan', role: 'allrounder' },
      { name: 'Khaleel Ahmed', role: 'bowler' },
      { name: 'Noor Ahmad', role: 'bowler' },
      { name: 'Jamie Overton', role: 'bowler' },
      { name: 'Nathan Ellis', role: 'bowler' },
      { name: 'Mukesh Choudhary', role: 'bowler' },
      { name: 'Shreyas Gopal', role: 'bowler' },
      { name: 'Rahul Chahar', role: 'bowler' },
      { name: 'Matt Henry', role: 'bowler' },
      { name: 'Akeal Hosein', role: 'bowler' },
    ],
  },
  {
    name: 'Delhi Capitals',
    short: 'DC',
    color: '#004c93',
    players: [
      { name: 'KL Rahul', role: 'wicketkeeper' },
      { name: 'Karun Nair', role: 'batsman' },
      { name: 'Tristan Stubbs', role: 'batsman' },
      { name: 'Sameer Rizvi', role: 'batsman' },
      { name: 'Nitish Rana', role: 'batsman' },
      { name: 'David Miller', role: 'batsman' },
      { name: 'Pathum Nissanka', role: 'batsman' },
      { name: 'Prithvi Shaw', role: 'batsman' },
      { name: 'Ben Duckett', role: 'wicketkeeper' },
      { name: 'Axar Patel', role: 'allrounder' },
      { name: 'Vipraj Nigam', role: 'allrounder' },
      { name: 'Ajay Mandal', role: 'allrounder' },
      { name: 'Auqib Dar', role: 'allrounder' },
      { name: 'Mitchell Starc', role: 'bowler' },
      { name: 'Kuldeep Yadav', role: 'bowler' },
      { name: 'T. Natarajan', role: 'bowler' },
      { name: 'Mukesh Kumar', role: 'bowler' },
      { name: 'Lungi Ngidi', role: 'bowler' },
      { name: 'Kyle Jamieson', role: 'bowler' },
      { name: 'Dushmantha Chameera', role: 'bowler' },
    ],
  },
  {
    name: 'Gujarat Titans',
    short: 'GT',
    color: '#1c1c2b',
    players: [
      { name: 'Shubman Gill', role: 'batsman' },
      { name: 'Sai Sudharsan', role: 'batsman' },
      { name: 'Shahrukh Khan', role: 'batsman' },
      { name: 'Tom Banton', role: 'batsman' },
      { name: 'Jos Buttler', role: 'wicketkeeper' },
      { name: 'Kumar Kushagra', role: 'wicketkeeper' },
      { name: 'Washington Sundar', role: 'allrounder' },
      { name: 'Glenn Phillips', role: 'allrounder' },
      { name: 'Rahul Tewatia', role: 'allrounder' },
      { name: 'Nishant Sindhu', role: 'allrounder' },
      { name: 'Jason Holder', role: 'allrounder' },
      { name: 'Kagiso Rabada', role: 'bowler' },
      { name: 'Rashid Khan', role: 'bowler' },
      { name: 'Mohammed Siraj', role: 'bowler' },
      { name: 'Prasidh Krishna', role: 'bowler' },
      { name: 'Ishant Sharma', role: 'bowler' },
      { name: 'Sai Kishore', role: 'bowler' },
      { name: 'Manav Suthar', role: 'bowler' },
    ],
  },
  {
    name: 'Kolkata Knight Riders',
    short: 'KKR',
    color: '#3a225d',
    players: [
      { name: 'Ajinkya Rahane', role: 'batsman' },
      { name: 'Rinku Singh', role: 'batsman' },
      { name: 'Manish Pandey', role: 'batsman' },
      { name: 'Rahul Tripathi', role: 'batsman' },
      { name: 'Finn Allen', role: 'wicketkeeper' },
      { name: 'Sunil Narine', role: 'allrounder' },
      { name: 'Cameron Green', role: 'allrounder' },
      { name: 'Rovman Powell', role: 'allrounder' },
      { name: 'Rachin Ravindra', role: 'allrounder' },
      { name: 'Anukul Roy', role: 'allrounder' },
      { name: 'Varun Chakaravarthy', role: 'bowler' },
      { name: 'Harshit Rana', role: 'bowler' },
      { name: 'Umran Malik', role: 'bowler' },
      { name: 'Matheesha Pathirana', role: 'bowler' },
      { name: 'Akash Deep', role: 'bowler' },
    ],
  },
  {
    name: 'Lucknow Super Giants',
    short: 'LSG',
    color: '#a72056',
    players: [
      { name: 'Rishabh Pant', role: 'wicketkeeper' },
      { name: 'Abdul Samad', role: 'batsman' },
      { name: 'Aiden Markram', role: 'batsman' },
      { name: 'Mitchell Marsh', role: 'batsman' },
      { name: 'Josh Inglis', role: 'batsman' },
      { name: 'Nicholas Pooran', role: 'wicketkeeper' },
      { name: 'Ayush Badoni', role: 'allrounder' },
      { name: 'Shahbaz Ahamad', role: 'allrounder' },
      { name: 'Wanindu Hasaranga', role: 'allrounder' },
      { name: 'Arshin Kulkarni', role: 'allrounder' },
      { name: 'Mohammed Shami', role: 'bowler' },
      { name: 'Mayank Yadav', role: 'bowler' },
      { name: 'Avesh Khan', role: 'bowler' },
      { name: 'Anrich Nortje', role: 'bowler' },
      { name: 'Arjun Tendulkar', role: 'bowler' },
    ],
  },
  {
    name: 'Mumbai Indians',
    short: 'MI',
    color: '#004ba0',
    players: [
      { name: 'Rohit Sharma', role: 'batsman' },
      { name: 'Surya Kumar Yadav', role: 'batsman' },
      { name: 'Tilak Varma', role: 'batsman' },
      { name: 'Sherfane Rutherford', role: 'batsman' },
      { name: 'Robin Minz', role: 'wicketkeeper' },
      { name: 'Quinton De Kock', role: 'wicketkeeper' },
      { name: 'Hardik Pandya', role: 'allrounder' },
      { name: 'Mitchell Santner', role: 'allrounder' },
      { name: 'Will Jacks', role: 'allrounder' },
      { name: 'Corbin Bosch', role: 'allrounder' },
      { name: 'Shardul Thakur', role: 'allrounder' },
      { name: 'Naman Dhir', role: 'allrounder' },
      { name: 'Jasprit Bumrah', role: 'bowler' },
      { name: 'Trent Boult', role: 'bowler' },
      { name: 'Deepak Chahar', role: 'bowler' },
      { name: 'Allah Ghazanfar', role: 'bowler' },
    ],
  },
  {
    name: 'Punjab Kings',
    short: 'PBKS',
    color: '#ed1b24',
    players: [
      { name: 'Shreyas Iyer', role: 'batsman' },
      { name: 'Nehal Wadhera', role: 'batsman' },
      { name: 'Shashank Singh', role: 'batsman' },
      { name: 'Harnoor Pannu', role: 'batsman' },
      { name: 'Prabhsimran Singh', role: 'wicketkeeper' },
      { name: 'Marcus Stoinis', role: 'allrounder' },
      { name: 'Marco Jansen', role: 'allrounder' },
      { name: 'Harpreet Brar', role: 'allrounder' },
      { name: 'Musheer Khan', role: 'allrounder' },
      { name: 'Azmatullah Omarzai', role: 'allrounder' },
      { name: 'Arshdeep Singh', role: 'bowler' },
      { name: 'Yuzvendra Chahal', role: 'bowler' },
      { name: 'Lockie Ferguson', role: 'bowler' },
      { name: 'Xavier Bartlett', role: 'bowler' },
      { name: 'Yash Thakur', role: 'bowler' },
    ],
  },
  {
    name: 'Rajasthan Royals',
    short: 'RR',
    color: '#ea1a85',
    players: [
      { name: 'Yashasvi Jaiswal', role: 'batsman' },
      { name: 'Riyan Parag', role: 'batsman' },
      { name: 'Shimron Hetmyer', role: 'batsman' },
      { name: 'Vaibhav Suryavanshi', role: 'batsman' },
      { name: 'Dhruv Jurel', role: 'wicketkeeper' },
      { name: 'Ravindra Jadeja', role: 'allrounder' },
      { name: 'Sam Curran', role: 'allrounder' },
      { name: 'Yudhvir Singh Charak', role: 'allrounder' },
      { name: 'Jofra Archer', role: 'bowler' },
      { name: 'Ravi Bishnoi', role: 'bowler' },
      { name: 'Tushar Deshpande', role: 'bowler' },
      { name: 'Sandeep Sharma', role: 'bowler' },
      { name: 'Kwena Maphaka', role: 'bowler' },
      { name: 'Adam Milne', role: 'bowler' },
    ],
  },
  {
    name: 'Royal Challengers Bengaluru',
    short: 'RCB',
    color: '#ec1c24',
    players: [
      { name: 'Virat Kohli', role: 'batsman' },
      { name: 'Rajat Patidar', role: 'batsman' },
      { name: 'Devdutt Padikkal', role: 'batsman' },
      { name: 'Jordan Cox', role: 'batsman' },
      { name: 'Phil Salt', role: 'wicketkeeper' },
      { name: 'Jitesh Sharma', role: 'wicketkeeper' },
      { name: 'Krunal Pandya', role: 'allrounder' },
      { name: 'Tim David', role: 'allrounder' },
      { name: 'Jacob Bethell', role: 'allrounder' },
      { name: 'Venkatesh Iyer', role: 'allrounder' },
      { name: 'Romario Shepherd', role: 'allrounder' },
      { name: 'Josh Hazlewood', role: 'bowler' },
      { name: 'Bhuvneshwar Kumar', role: 'bowler' },
      { name: 'Yash Dayal', role: 'bowler' },
      { name: 'Rasikh Salam', role: 'bowler' },
      { name: 'Nuwan Thushara', role: 'bowler' },
    ],
  },
  {
    name: 'Sunrisers Hyderabad',
    short: 'SRH',
    color: '#ff822a',
    players: [
      { name: 'Travis Head', role: 'batsman' },
      { name: 'Aniket Verma', role: 'batsman' },
      { name: 'Liam Livingstone', role: 'batsman' },
      { name: 'Ishan Kishan', role: 'wicketkeeper' },
      { name: 'Heinrich Klaasen', role: 'wicketkeeper' },
      { name: 'Abhishek Sharma', role: 'allrounder' },
      { name: 'Nitish Kumar Reddy', role: 'allrounder' },
      { name: 'Kamindu Mendis', role: 'allrounder' },
      { name: 'Harshal Patel', role: 'allrounder' },
      { name: 'Brydon Carse', role: 'allrounder' },
      { name: 'Pat Cummins', role: 'bowler' },
      { name: 'Jaydev Unadkat', role: 'bowler' },
      { name: 'Shivam Mavi', role: 'bowler' },
      { name: 'Eshan Malinga', role: 'bowler' },
    ],
  },
];

/**
 * Role-based gesture restrictions for Hand Cricket.
 * Batsmen & Wicketkeepers: Can play 0–6 (all gestures)
 * All-rounders: Can play 0, 1, 2, 3, 4 only
 * Bowlers: Can play 0, 1, 2 only
 * Playing an illegal gesture = automatic WICKET
 */
export const ROLE_ALLOWED_GESTURES = {
  batsman: [0, 1, 2, 3, 4, 5, 6],
  wicketkeeper: [0, 1, 2, 3, 4, 5, 6],
  allrounder: [0, 1, 2, 3, 4],
  bowler: [0, 1, 2],
};

/**
 * Role display labels and emoji.
 */
export const ROLE_INFO = {
  batsman: { label: 'Batsman', emoji: '🏏', color: '#00e676' },
  wicketkeeper: { label: 'WK-Bat', emoji: '🧤', color: '#00e676' },
  allrounder: { label: 'All-Rounder', emoji: '⚡', color: '#ffd740' },
  bowler: { label: 'Bowler', emoji: '🎳', color: '#448aff' },
};

/**
 * Team composition — flexible.
 * Just need exactly 10 players, any combination of roles.
 */
export const TEAM_TOTAL = 10;

/**
 * Bowler Power — makes bowlers valuable on the fielding side.
 *
 * ACCURACY_CAP: When a bowler is in the bowling lineup, opponent's runs
 *   are capped to this max per ball (e.g., 4 instead of 6).
 *
 * SPECIAL_DELIVERY_CHANCE: Probability (0–1) that a bowler triggers a
 *   Yorker or Bouncer. When triggered, the batsman MUST play 0 or 1,
 *   otherwise they are automatically OUT.
 *
 * ALLROUNDER_CAP: All-rounders provide a weaker cap when bowling.
 */
export const BOWLER_POWER = {
  bowler: {
    accuracyCap: 4,             // opponent max runs per ball
    specialDeliveryChance: 0.30, // 30% chance of yorker/bouncer
  },
  allrounder: {
    accuracyCap: 5,             // weaker cap than pure bowler
    specialDeliveryChance: 0.15, // 15% chance
  },
  batsman: {
    accuracyCap: 6,             // no cap
    specialDeliveryChance: 0,
  },
  wicketkeeper: {
    accuracyCap: 6,
    specialDeliveryChance: 0,
  },
};
