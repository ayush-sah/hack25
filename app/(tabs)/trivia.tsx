import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  FlatList,
  Easing,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Audio } from "expo-av";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
  FontAwesome,
} from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Add a shuffle function
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Change categoryIcons to a function that takes a color
const categoryIcons: Record<string, (color: string) => JSX.Element> = {
  General: (color) => (
    <MaterialCommunityIcons name="finance" size={32} color={color} />
  ),
  Barriers: (color) => (
    <MaterialCommunityIcons name="block-helper" size={32} color={color} />
  ),
  Consequences: (color) => (
    <MaterialCommunityIcons name="alert-circle" size={32} color={color} />
  ),
  Solutions: (color) => (
    <MaterialCommunityIcons name="lightbulb-on" size={32} color={color} />
  ),
  "Banking Basics": (color) => (
    <FontAwesome5 name="university" size={32} color={color} />
  ),
  "Saving & Budgeting": (color) => (
    <FontAwesome5 name="piggy-bank" size={32} color={color} />
  ),
  "Credit & Loans": (color) => (
    <FontAwesome5 name="credit-card" size={32} color={color} />
  ),
  "Digital Finance": (color) => (
    <Ionicons name="phone-portrait" size={32} color={color} />
  ),
  Investing: (color) => (
    <FontAwesome name="line-chart" size={32} color={color} />
  ),
  Insurance: (color) => (
    <MaterialCommunityIcons name="shield-check" size={32} color={color} />
  ),
  "Retirement Planning": (color) => (
    <FontAwesome5 name="user-clock" size={32} color={color} />
  ),
  Taxes: (color) => (
    <FontAwesome5 name="file-invoice-dollar" size={32} color={color} />
  ),
};

const allQuestions = [
  // General
  {
    category: "General",
    question: "What is financial exclusion?",
    options: [
      "Lack of access to basic financial services",
      "Having too many bank accounts",
      "Owning expensive assets",
      "Paying high taxes",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Financial exclusion means not having access to basic financial services like a bank account or credit.",
  },
  {
    category: "General",
    question: "Which of the following is a sign of financial inclusion?",
    options: [
      "Access to affordable credit",
      "No access to savings accounts",
      "High transaction fees",
      "Lack of financial education",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Financial inclusion means people can access affordable and useful financial products and services.",
  },
  {
    category: "General",
    question: "Which organization promotes financial inclusion globally?",
    options: ["World Bank", "FIFA", "UNESCO", "NATO"],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "The World Bank and other international organizations work to promote financial inclusion worldwide.",
  },
  {
    category: "General",
    question: "Which is NOT a benefit of financial inclusion?",
    options: [
      "Access to affordable loans",
      "Ability to save securely",
      "Increased financial risk",
      "Convenient payments",
    ],
    answer: 2,
    image: require("../../assets/images/faq.png"),
    fact: "Financial inclusion reduces risk, not increases it.",
  },
  {
    category: "General",
    question: "Financial inclusion helps to:",
    options: [
      "Reduce poverty",
      "Increase inequality",
      "Discourage saving",
      "Limit access to credit",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "It helps reduce poverty by providing access to financial services.",
  },
  // Barriers
  {
    category: "Barriers",
    question: "Which group is MOST at risk of financial exclusion?",
    options: [
      "Young professionals",
      "Rural populations",
      "Bank managers",
      "Tech entrepreneurs",
    ],
    answer: 1,
    image: require("../../assets/images/child-teens.png"),
    fact: "Rural populations often face challenges like distance to financial institutions, lack of infrastructure, and limited access to formal banking services.",
  },
  {
    category: "Barriers",
    question: "What is a common barrier to financial inclusion?",
    options: [
      "Lack of documentation",
      "Owning a smartphone",
      "Having a job",
      "Living in a city",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Lack of documentation, particularly identity documents, is a significant barrier for many individuals seeking financial services.",
  },
  {
    category: "Barriers",
    question: "Which of the following is NOT a barrier to financial inclusion?",
    options: [
      "High transaction costs",
      "Financial literacy",
      "Geographical distance",
      "Lack of trust in banks",
    ],
    answer: 1,
    image: require("../../assets/images/child-teens.png"),
    fact: "Financial literacy actually helps overcome barriers to financial inclusion.",
  },
  {
    category: "Barriers",
    question: "Which is a technological barrier to financial inclusion?",
    options: [
      "Lack of internet access",
      "Owning a bank account",
      "Having a smartphone",
      "Living in a city",
    ],
    answer: 0,
    image: require("../../assets/images/child-teens.png"),
    fact: "Lack of internet access can prevent people from using digital financial services.",
  },
  {
    category: "Barriers",
    question:
      "Cultural beliefs can be a barrier to financial inclusion. True or False?",
    options: ["True", "False", "", ""],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Cultural beliefs and norms can discourage people from using formal financial services.",
  },
  // Consequences
  {
    category: "Consequences",
    question: "Which of the following is a consequence of financial exclusion?",
    options: [
      "Improved credit score",
      "Limited access to loans",
      "Lower interest rates",
      "More investment opportunities",
    ],
    answer: 1,
    image: require("../../assets/images/reminder.png"),
    fact: "Financial exclusion often leads to limited access to credit, which can result in higher interest rates and reduced investment opportunities.",
  },
  {
    category: "Consequences",
    question: "How does financial exclusion affect poverty?",
    options: [
      "It helps reduce poverty",
      "It has no effect",
      "It can increase poverty",
      "It guarantees wealth",
    ],
    answer: 2,
    image: require("../../assets/images/reminder.png"),
    fact: "Financial exclusion can trap people in poverty by limiting their ability to save, borrow, and invest.",
  },
  {
    category: "Consequences",
    question: "What is a social consequence of financial exclusion?",
    options: [
      "Greater social inclusion",
      "Increased economic opportunities",
      "Social isolation",
      "Improved health",
    ],
    answer: 2,
    image: require("../../assets/images/reminder.png"),
    fact: "Financial exclusion can lead to social isolation and reduced participation in community life.",
  },
  {
    category: "Consequences",
    question: "Financial exclusion can lead to:",
    options: [
      "Greater economic stability",
      "Limited access to insurance",
      "Lower poverty rates",
      "More investment",
    ],
    answer: 1,
    image: require("../../assets/images/reminder.png"),
    fact: "Without access to insurance, people are more vulnerable to financial shocks.",
  },
  {
    category: "Consequences",
    question: "Which is a likely outcome of being financially excluded?",
    options: [
      "Improved social status",
      "Difficulty saving money",
      "Easier access to loans",
      "Lower interest rates",
    ],
    answer: 1,
    image: require("../../assets/images/reminder.png"),
    fact: "Financial exclusion makes it harder to save and access credit.",
  },
  // Solutions
  {
    category: "Solutions",
    question: "Which service helps reduce financial exclusion?",
    options: [
      "Microfinance",
      "Luxury banking",
      "Stock trading",
      "Cryptocurrency speculation",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Microfinance institutions provide small loans and financial services to low-income individuals, helping them build credit and access formal financial systems.",
  },
  {
    category: "Solutions",
    question:
      "What is a government policy that can promote financial inclusion?",
    options: [
      "Subsidizing basic bank accounts",
      "Raising ATM fees",
      "Limiting mobile banking",
      "Discouraging savings",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Subsidizing basic bank accounts makes financial services more accessible to everyone.",
  },
  {
    category: "Solutions",
    question: "Which technology is helping to increase financial inclusion?",
    options: [
      "Mobile banking",
      "Typewriters",
      "Fax machines",
      "Landline phones",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Mobile banking allows people to access financial services even in remote areas.",
  },
  {
    category: "Solutions",
    question: "Financial education programs are important because they:",
    options: [
      "Help people make informed decisions",
      "Discourage saving",
      "Increase financial exclusion",
      "Promote risky investments",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Education empowers people to use financial services wisely.",
  },
  {
    category: "Solutions",
    question: "Which is a digital solution to promote financial inclusion?",
    options: [
      "Mobile money services",
      "Paper checks",
      "Manual ledgers",
      "Cash only",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Mobile money services allow people to send and receive money easily.",
  },
  // Banking Basics
  {
    category: "Banking Basics",
    question: "What is the main purpose of a savings account?",
    options: [
      "To store money securely and earn interest",
      "To borrow money",
      "To pay taxes",
      "To invest in stocks",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Savings accounts are primarily for storing money securely and earning interest, which is a safe and accessible way to save.",
  },
  {
    category: "Banking Basics",
    question: "What is a checking account used for?",
    options: [
      "Everyday transactions",
      "Long-term savings",
      "Buying stocks",
      "Paying taxes",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Checking accounts are designed for frequent transactions like deposits, withdrawals, and bill payments.",
  },
  {
    category: "Banking Basics",
    question: "Which of the following is NOT a function of a bank?",
    options: [
      "Providing loans",
      "Accepting deposits",
      "Selling groceries",
      "Facilitating payments",
    ],
    answer: 2,
    image: require("../../assets/images/faq.png"),
    fact: "Banks do not sell groceries; they provide financial services like loans, deposits, and payments.",
  },
  {
    category: "Banking Basics",
    question: "Which is a feature of online banking?",
    options: [
      "24/7 access",
      "Only available at branches",
      "Requires cash",
      "No security",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Online banking provides access to accounts anytime, anywhere.",
  },
  {
    category: "Banking Basics",
    question: "A debit card is used to:",
    options: [
      "Withdraw money from your account",
      "Borrow money",
      "Earn interest",
      "Pay taxes",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Debit cards allow you to access your own funds for purchases and withdrawals.",
  },
  // Saving & Budgeting
  {
    category: "Saving & Budgeting",
    question: "Why is it important to have a budget?",
    options: [
      "To track income and expenses",
      "To avoid paying bills",
      "To increase spending",
      "To get a loan",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "Having a budget is crucial for managing finances, ensuring you don't overspend, and achieving financial goals.",
  },
  {
    category: "Saving & Budgeting",
    question: "What is an emergency fund?",
    options: [
      "Money set aside for unexpected expenses",
      "Money for shopping",
      "A loan from the bank",
      "A type of insurance",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "An emergency fund helps you cover unexpected expenses like medical bills or car repairs without going into debt.",
  },
  {
    category: "Saving & Budgeting",
    question: "Which is a good budgeting rule?",
    options: [
      "50/30/20 rule",
      "Spend all you earn",
      "Never save",
      "Ignore expenses",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and saving 20% of your income.",
  },
  {
    category: "Saving & Budgeting",
    question: "What is a good reason to save money?",
    options: [
      "For emergencies",
      "To spend more",
      "To avoid budgeting",
      "To pay more taxes",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "Saving for emergencies helps you handle unexpected expenses.",
  },
  {
    category: "Saving & Budgeting",
    question: "Budgeting helps you to:",
    options: [
      "Control spending",
      "Increase debt",
      "Ignore expenses",
      "Spend all your money",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "Budgeting is a key tool for financial health.",
  },
  // Credit & Loans
  {
    category: "Credit & Loans",
    question: "What does a credit score represent?",
    options: [
      "A person’s creditworthiness",
      "The amount of cash in your wallet",
      "Your age",
      "Your monthly rent",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "A credit score is a numerical representation of a person's creditworthiness, based on their history of borrowing and repaying loans.",
  },
  {
    category: "Credit & Loans",
    question: "What is interest on a loan?",
    options: [
      "The cost of borrowing money",
      "A government tax",
      "A type of insurance",
      "A bank fee",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Interest is the extra amount you pay back to the lender in addition to the amount you borrowed.",
  },
  {
    category: "Credit & Loans",
    question: "Which is a type of loan?",
    options: [
      "Personal loan",
      "Grocery bill",
      "Utility payment",
      "Insurance premium",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Personal loans, home loans, and car loans are all types of loans offered by banks and financial institutions.",
  },
  {
    category: "Credit & Loans",
    question: "A loan must be:",
    options: [
      "Repaid with interest",
      "Given as a gift",
      "Ignored",
      "Never paid back",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Loans are borrowed money that must be repaid, usually with interest.",
  },
  {
    category: "Credit & Loans",
    question: "Which can improve your credit score?",
    options: [
      "Paying bills on time",
      "Missing payments",
      "Taking on too much debt",
      "Ignoring credit reports",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Timely payments are crucial for a good credit score.",
  },
  // Digital Finance
  {
    category: "Digital Finance",
    question: "Which of the following is a digital payment method?",
    options: ["Mobile wallet", "Cheque", "Cash", "Gold"],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Digital payment methods like mobile wallets and online banking are convenient and secure ways to transfer money.",
  },
  {
    category: "Digital Finance",
    question: "What is online banking?",
    options: [
      "Managing your bank account via the internet",
      "Visiting a branch",
      "Using only cash",
      "Mailing checks",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Online banking allows you to manage your finances from anywhere using a computer or smartphone.",
  },
  {
    category: "Digital Finance",
    question: "Which is a benefit of digital finance?",
    options: [
      "Faster transactions",
      "Longer wait times",
      "More paperwork",
      "Less security",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Digital finance enables faster, more efficient, and often more secure transactions.",
  },
  {
    category: "Digital Finance",
    question: "Which is a risk of digital finance?",
    options: [
      "Cybersecurity threats",
      "Faster transactions",
      "Lower costs",
      "Greater convenience",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "It is important to protect your information online.",
  },
  {
    category: "Digital Finance",
    question: "Digital finance can help people in rural areas by:",
    options: [
      "Providing access to banking services",
      "Making cash payments only",
      "Limiting access to credit",
      "Discouraging saving",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Digital finance bridges the gap for underserved populations.",
  },
  // Investing
  {
    category: "Investing",
    question: "What is a stock?",
    options: [
      "A share in the ownership of a company",
      "A type of loan",
      "A government tax",
      "A savings account",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "A stock represents a share in the ownership of a company, giving investors a claim on the company's assets and earnings.",
  },
  {
    category: "Investing",
    question: "What is diversification in investing?",
    options: [
      "Spreading investments across different assets",
      "Putting all money in one stock",
      "Only saving cash",
      "Avoiding all risk",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Diversification helps reduce risk by spreading investments across different types of assets.",
  },
  {
    category: "Investing",
    question: "Which is a low-risk investment?",
    options: [
      "Government bonds",
      "Cryptocurrency",
      "Penny stocks",
      "Lottery tickets",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Government bonds are generally considered low-risk compared to stocks or cryptocurrencies.",
  },
  {
    category: "Investing",
    question: "Investing can help you to:",
    options: [
      "Grow your wealth",
      "Lose all your money",
      "Avoid saving",
      "Pay more taxes",
    ],
    answer: 0,
    image: require("../../assets/images/faq.png"),
    fact: "Investing is a way to build wealth over time.",
  },
  // Insurance
  {
    category: "Insurance",
    question: "What is the main purpose of insurance?",
    options: [
      "To protect against financial loss",
      "To increase income",
      "To pay more taxes",
      "To get a loan",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Insurance is a risk management tool that protects individuals and businesses against financial loss in the event of unexpected events.",
  },
  {
    category: "Insurance",
    question: "What is a premium in insurance?",
    options: [
      "The amount paid for coverage",
      "A type of investment",
      "A loan payment",
      "A tax refund",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "A premium is the amount you pay regularly to keep your insurance policy active.",
  },
  {
    category: "Insurance",
    question: "Which is a type of insurance?",
    options: [
      "Health insurance",
      "Movie ticket",
      "Bank account",
      "Lottery ticket",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Health, life, auto, and home insurance are all common types of insurance.",
  },
  {
    category: "Insurance",
    question: "Which is NOT a type of insurance?",
    options: [
      "Car insurance",
      "Health insurance",
      "Vacation insurance",
      "Movie ticket",
    ],
    answer: 3,
    image: require("../../assets/images/family-support.png"),
    fact: "Movie tickets are not insurance products.",
  },
  {
    category: "Insurance",
    question: "Insurance helps to:",
    options: [
      "Protect against unexpected losses",
      "Increase risk",
      "Discourage saving",
      "Avoid planning",
    ],
    answer: 0,
    image: require("../../assets/images/family-support.png"),
    fact: "Insurance is a safety net for individuals and families.",
  },
  // Retirement Planning
  {
    category: "Retirement Planning",
    question: "Why is it important to save for retirement?",
    options: [
      "To have income when you stop working",
      "To pay for vacations",
      "To buy a new car",
      "To pay off credit cards",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "Saving for retirement is crucial for ensuring financial stability and independence during your later years.",
  },
  {
    category: "Retirement Planning",
    question: "What is a pension?",
    options: [
      "A regular payment made during retirement",
      "A type of loan",
      "A tax",
      "A shopping discount",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "A pension is a regular payment made to a person during retirement from an investment fund or employer.",
  },
  {
    category: "Retirement Planning",
    question: "Which is a good way to plan for retirement?",
    options: [
      "Start saving early",
      "Spend all your income",
      "Rely only on lottery",
      "Ignore retirement",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "Starting to save early and investing regularly are key to a secure retirement.",
  },
  {
    category: "Retirement Planning",
    question: "Which is a retirement savings vehicle?",
    options: ["Pension plan", "Credit card", "Car loan", "Mortgage"],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "Pension plans and IRAs are common retirement savings tools.",
  },
  {
    category: "Retirement Planning",
    question: "Planning for retirement should start:",
    options: [
      "As early as possible",
      "Right before retiring",
      "After age 60",
      "Never",
    ],
    answer: 0,
    image: require("../../assets/images/reminder.png"),
    fact: "The earlier you start, the more you can save and grow your retirement fund.",
  },
  // Taxes
  {
    category: "Taxes",
    question: "What are taxes used for?",
    options: [
      "To fund public services like roads and schools",
      "To increase personal savings",
      "To pay off personal loans",
      "To buy stocks",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Taxes are a mandatory contribution to public services, including infrastructure, education, and healthcare, which are essential for societal well-being.",
  },
  {
    category: "Taxes",
    question: "What is income tax?",
    options: [
      "A tax on earnings from work or investments",
      "A fee for using a bank",
      "A type of insurance",
      "A loan payment",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Income tax is a tax governments impose on income generated by businesses and individuals.",
  },
  {
    category: "Taxes",
    question: "Which is NOT a type of tax?",
    options: ["Sales tax", "Property tax", "Interest tax", "Vacation tax"],
    answer: 3,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "There is no such thing as a vacation tax; common taxes include sales, property, and income tax.",
  },
  {
    category: "Taxes",
    question: "Which is a direct tax?",
    options: ["Income tax", "Sales tax", "Value-added tax", "Excise duty"],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Income tax is paid directly by individuals or organizations to the government.",
  },
  {
    category: "Taxes",
    question: "Paying taxes is important because:",
    options: [
      "It funds public services",
      "It increases personal wealth",
      "It is optional",
      "It reduces government revenue",
    ],
    answer: 0,
    image: require("../../assets/images/engaging_activity.png"),
    fact: "Taxes are essential for funding infrastructure, education, and healthcare.",
  },
];

const categories = [
  { key: "General", label: "General" },
  { key: "Barriers", label: "Barriers" },
  { key: "Consequences", label: "Consequences" },
  { key: "Solutions", label: "Solutions" },
  { key: "Banking Basics", label: "Banking Basics" },
  { key: "Saving & Budgeting", label: "Saving & Budgeting" },
  { key: "Credit & Loans", label: "Credit & Loans" },
  { key: "Digital Finance", label: "Digital Finance" },
  { key: "Investing", label: "Investing" },
  { key: "Insurance", label: "Insurance" },
  { key: "Retirement Planning", label: "Retirement Planning" },
  { key: "Taxes", label: "Taxes" },
];

const correctImg = require("../../assets/images/happy.png");
const incorrectImg = require("../../assets/images/reminder.png");
const completeSound = require("../../assets/sounds/complete.mp3");
const flipSound = require("../../assets/sounds/flip.mp3");
const matchSound = require("../../assets/sounds/match.mp3");
const nomatchSound = require("../../assets/sounds/nomatch.mp3");

export default function TriviaGame() {
  const [category, setCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedbackImg, setFeedbackImg] = useState<any>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [showNext, setShowNext] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [timer, setTimer] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // Remove userQuestions state and all logic related to adding user questions
  const [showNextModal, setShowNextModal] = useState(false);

  const playSound = async (soundFile: any) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(soundFile);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      // ignore sound errors
    }
  };

  // In handleCategorySelect, shuffle and select a subset of questions
  const handleCategorySelect = async (cat: string) => {
    setCategory(cat);
    const shuffled = shuffleArray(
      allQuestions.filter((q) => q.category === cat)
    );
    setQuestions(shuffled.slice(0, 7)); // Show 7 random questions per quiz
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
    setFeedbackImg(null);
    setShowNext(false);
    progress.setValue(0);
    await playSound(flipSound);
  };

  const handleOptionPress = async (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowNext(true);
    if (index === questions[current].answer) {
      setScore(score + 1);
      setFeedbackImg(correctImg);
      setStreak((s) => s + 1);
      await playSound(matchSound);
    } else {
      setFeedbackImg(incorrectImg);
      setStreak(0);
      await playSound(nomatchSound);
    }
    if (timerRef.current) clearInterval(timerRef.current);
    Animated.timing(progress, {
      toValue: (current + 1) / questions.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setShowNextModal(true);
  };

  const handleNext = async () => {
    setShowNext(false);
    setFeedbackImg(null);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      animateCard();
      await playSound(flipSound);
    } else {
      setShowResult(true);
      await playSound(completeSound);
    }
  };

  const handleRestart = async () => {
    setCategory(null);
    setQuestions([]);
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
    setFeedbackImg(null);
    setShowNext(false);
    progress.setValue(0);
    await playSound(flipSound);
  };

  // Only use original questions for the current category
  const questionsToDisplay = React.useMemo(() => {
    if (!category) return [];
    return allQuestions.filter((q) => q.category === category);
  }, [category]);

  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Timer effect
  React.useEffect(() => {
    if (category && !showResult && selected === null) {
      setTimer(15);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleOptionPress(-1); // -1 means timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, category, showResult]);

  // Animated card transition
  const animateCard = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    animateCard();
  }, [current]);

  // Streak logic
  React.useEffect(() => {
    if (streak > 1) {
      setShowStreak(true);
      setTimeout(() => setShowStreak(false), 1200);
    }
  }, [streak]);

  if (!category) {
    // Interactive category grid
    const renderCategory = ({
      item,
    }: {
      item: { key: string; label: string };
    }) => {
      const isSelected = selectedCat === item.key;
      const iconColor = isSelected ? "#fff" : "#008080"; // white if selected, teal otherwise
      const textColor = isSelected ? "#fff" : "#008080";
      return (
        <TouchableOpacity
          key={item.key}
          style={[styles.categoryBtn, isSelected && styles.categoryBtnSelected]}
          activeOpacity={0.8}
          onPress={() => setSelectedCat(item.key)}
          onLongPress={async () => {
            setSelectedCat(item.key);
            await handleCategorySelect(item.key);
          }}
        >
          <View style={styles.categoryIcon}>
            {categoryIcons[item.key](iconColor)}
          </View>
          <ThemedText style={[styles.categoryText, { color: textColor }]}>
            {item.label}
          </ThemedText>
        </TouchableOpacity>
      );
    };
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Select a Category
        </ThemedText>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.key}
          numColumns={2}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={styles.categoryGrid}
        />
        {selectedCat && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => handleCategorySelect(selectedCat)}
          >
            <ThemedText style={styles.startBtnText}>Start Quiz</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    );
  }

  if (showResult) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.bannerRow}>
          {category && categoryIcons[category]("#DE3163")}
          <ThemedText type="title" style={styles.title}>
            {category} Complete!
          </ThemedText>
        </View>
        <Image
          source={
            score >= Math.ceil(questionsToDisplay.length / 2)
              ? correctImg
              : incorrectImg
          }
          style={styles.resultImg}
        />
        <ThemedText style={styles.score}>
          Your Score: {score} / {questionsToDisplay.length}
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={handleRestart}>
          <ThemedText style={styles.buttonText}>Play Again</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Main trivia UI
  return (
    <ThemedView style={styles.container}>
      {showStreak && (
        <View style={styles.streakBanner}>
          <ThemedText style={styles.streakText}>
            🔥 {streak} Correct in a Row!
          </ThemedText>
        </View>
      )}
      <View style={styles.bannerRow}>
        {category && categoryIcons[category]("#DE3163")}
        <ThemedText type="title" style={styles.title}>
          {category} Trivia
        </ThemedText>
      </View>
      <View style={styles.progressBarBg}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, SCREEN_WIDTH - 80],
              }),
            },
          ]}
        />
      </View>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Image
          source={feedbackImg ? feedbackImg : questionsToDisplay[current].image}
          style={styles.questionImg}
        />
        <ThemedText style={styles.question}>
          {questionsToDisplay[current].question}
        </ThemedText>
        <View style={styles.timerRow}>
          <ThemedText
            style={[styles.timer, timer <= 5 && { color: "#E74C3C" }]}
          >
            {timer}s
          </ThemedText>
        </View>
        {questionsToDisplay[current].options.map(
          (option: string, idx: number) => {
            let optionStyle = styles.option;
            let optionTextStyle = styles.optionText;
            if (selected !== null) {
              if (idx === questionsToDisplay[current].answer) {
                optionStyle = Object.assign({}, styles.option, styles.correct);
                optionTextStyle = {
                  ...styles.optionText,
                  color: "#fff",
                  fontWeight: "600",
                };
              } else if (
                idx === selected &&
                selected !== questionsToDisplay[current].answer
              ) {
                optionStyle = Object.assign(
                  {},
                  styles.option,
                  styles.incorrect
                );
                optionTextStyle = {
                  ...styles.optionText,
                  color: "#fff",
                  fontWeight: "600",
                };
              }
            }
            return (
              <TouchableOpacity
                key={idx}
                style={optionStyle}
                onPress={() => handleOptionPress(idx)}
                disabled={selected !== null}
              >
                <ThemedText style={optionTextStyle}>{option}</ThemedText>
              </TouchableOpacity>
            );
          }
        )}
        <Modal
          visible={showNextModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNextModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
                width: "80%",
                maxWidth: 350,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 10,
                  color:
                    selected === questionsToDisplay[current].answer
                      ? "#27AE60"
                      : "#E74C3C",
                  textAlign: "center",
                }}
              >
                {selected === questionsToDisplay[current].answer
                  ? "🎉 Correct!"
                  : "❌ Incorrect"}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 18,
                  marginBottom: 16,
                  textAlign: "center",
                  color: "#222",
                  fontWeight: "500",
                }}
              >
                {questionsToDisplay[current].fact}
              </ThemedText>
              <TouchableOpacity
                style={{
                  backgroundColor: "#27AE60",
                  paddingVertical: 14,
                  paddingHorizontal: 36,
                  borderRadius: 8,
                  marginTop: 8,
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  setShowNextModal(false);
                  handleNext();
                }}
              >
                <ThemedText
                  style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}
                >
                  Next Question
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Animated.View>
      <ThemedText style={styles.progress}>
        Question {current + 1} of {questionsToDisplay.length}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
    paddingTop: 48, // Added top padding to prevent going beyond top
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    marginTop: 10,
  },
  title: {
    color: "#DE3163",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBarBg: {
    width: SCREEN_WIDTH - 80,
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 18,
    overflow: "hidden",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#27AE60",
    borderRadius: 8,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
    marginBottom: 18,
  },
  questionImg: {
    width: 100,
    height: 100,
    marginBottom: 10,
    resizeMode: "contain",
  },
  resultImg: {
    width: 140,
    height: 140,
    marginBottom: 18,
    resizeMode: "contain",
  },
  question: {
    fontSize: 22, // increased from 20
    marginBottom: 18, // increased spacing
    textAlign: "center",
    fontWeight: "bold", // bolder
    color: "#1a1a1a", // darker for contrast
  },
  option: {
    width: "100%",
    backgroundColor: "#f9f9f9", // lighter background
    padding: 16, // more padding
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 18, // larger
    color: "#1a1a1a", // always dark for contrast
    fontWeight: "600",
  },
  correct: {
    backgroundColor: "#27AE60", // strong green
    borderColor: "#27AE60",
  },
  incorrect: {
    backgroundColor: "#E74C3C", // strong red
    borderColor: "#E74C3C",
  },
  feedbackBanner: {
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: "#F9F871",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nextBtn: {
    backgroundColor: "#27AE60",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 12,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  progress: {
    marginTop: 8,
    fontSize: 16,
    color: "#008080",
  },
  score: {
    fontSize: 22,
    marginVertical: 18,
    color: "#008080",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#DE3163",
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  confetti: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10,
  },
  categoryBtn: {
    backgroundColor: "#f0f0f0",
    padding: 18,
    borderRadius: 14,
    margin: 8,
    width: (SCREEN_WIDTH - 80) / 2 - 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
    transform: [{ scale: 1 }],
  },
  categoryBtnSelected: {
    backgroundColor: "#DE3163",
    borderColor: "#DE3163",
    transform: [{ scale: 1.06 }],
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 18,
    color: "#008080", // default teal, will be overridden inline if selected
    fontWeight: "bold",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryGrid: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  startBtn: {
    backgroundColor: "#27AE60",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 18,
    alignSelf: "center",
  },
  startBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  streakBanner: {
    backgroundColor: "#27AE60",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  streakText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  timerRow: {
    marginTop: 10,
    marginBottom: 10,
  },
  timer: {
    fontSize: 28, // larger
    fontWeight: "bold",
    color: "#27AE60",
    textShadowColor: "#fff",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  factText: {
    marginTop: 12,
    fontSize: 18, // larger
    color: "#222", // darker
    textAlign: "center",
    fontWeight: "500",
  },
  addQBtn: {
    backgroundColor: "#27AE60",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "center",
  },
  addQBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },
  answerBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  answerBtnSelected: {
    backgroundColor: "#27AE60",
    borderColor: "#27AE60",
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
  },
  modalBtn: {
    backgroundColor: "#27AE60",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
