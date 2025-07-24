import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const languages = [
  { label: "German", value: "de" },
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "Hebrew", value: "he" },
  { label: "Italian", value: "it" },
  { label: "Dutch", value: "nl" },
  { label: "Norwegian", value: "no" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Chinese", value: "zh" },
  { label: "Hindi", value: "hi" },
  { label: "Bengali", value: "bn" },
  { label: "Japanese", value: "jp" },
  { label: "Turkish", value: "tr" },
  { label: "Czech", value: "cz" },
  { label: "Finnish", value: "fi" },
  { label: "Hungarian", value: "hu" },
  { label: "Indonesian", value: "id" },
  { label: "Korean", value: "ko" },
  { label: "Slovak", value: "sk" },
  { label: "Thai", value: "th" },
  { label: "Vietnamese", value: "vi" },
];

const NEWS_API_KEY = "";
const NEWS_API_URL = "https://newsapi.org/v2/everything";

type Article = {
  author?: string;
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  content?: string;
};

const ARTICLES_PER_PAGE = 10;

const NewsScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const loadMoreScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchArticles(1, true);
  }, [selectedLanguage]);

  const fetchArticles = async (pageToFetch: number, reset: boolean = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const url = `${NEWS_API_URL}?q=finance&language=${selectedLanguage}&pageSize=${ARTICLES_PER_PAGE}&page=${pageToFetch}&apiKey=${NEWS_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch news");
      const data = await response.json();
      if (data.articles) {
        setArticles(reset ? data.articles : [...articles, ...data.articles]);
        setHasMore(data.articles.length === ARTICLES_PER_PAGE);
      } else {
        setError("No articles found.");
        setHasMore(false);
      }
    } catch (err) {
      setError("Could not load news articles.");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    Animated.sequence([
      Animated.timing(loadMoreScale, {
        toValue: 1.15,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(loadMoreScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage);
    });
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the article.")
    );
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleRow}
      onPress={() => openUrl(item.url)}
    >
      {item.urlToImage ? (
        <Image source={{ uri: item.urlToImage }} style={styles.articleImage} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.articleDescription} numberOfLines={3}>
          {item.description
            ? item.description.slice(0, 100) +
              (item.description.length > 100 ? "..." : "")
            : "No description available."}
        </Text>
        <Text style={styles.articleMeta}>
          {item.author ? `By ${item.author} • ` : ""}
          {new Date(item.publishedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const translations: Record<
    string,
    { stayInformed: string; selectLanguage: string; newsTitle: string }
  > = {
    en: {
      stayInformed: "Stay Informed",
      selectLanguage: "Select Language",
      newsTitle: "Financial Inclusion News",
    },
    de: {
      stayInformed: "Bleiben Sie informiert",
      selectLanguage: "Sprache auswählen",
      newsTitle: "Nachrichten zur finanziellen Inklusion",
    },
    es: {
      stayInformed: "Mantente informado",
      selectLanguage: "Seleccionar idioma",
      newsTitle: "Noticias de inclusión financiera",
    },
    fr: {
      stayInformed: "Restez informé",
      selectLanguage: "Choisir la langue",
      newsTitle: "Actualités sur l'inclusion financière",
    },
    hi: {
      stayInformed: "सूचित रहें",
      selectLanguage: "भाषा चुनें",
      newsTitle: "वित्तीय समावेशन समाचार",
    },
    zh: {
      stayInformed: "保持关注",
      selectLanguage: "选择语言",
      newsTitle: "金融包容性新闻",
    },
    bn: {
      stayInformed: "সতর্ক থাকুন",
      selectLanguage: "ভাষা নির্বাচন করুন",
      newsTitle: "আর্থিক অন্তর্ভুক্তি সংবাদ",
    },
    jp: {
      stayInformed: "最新情報を入手",
      selectLanguage: "言語を選択",
      newsTitle: "金融包摂ニュース",
    },
    tr: {
      stayInformed: "Haberdar Olun",
      selectLanguage: "Dil Seçin",
      newsTitle: "Finansal Kapsayıcılık Haberleri",
    },
    cz: {
      stayInformed: "Zůstaňte informováni",
      selectLanguage: "Vyberte jazyk",
      newsTitle: "Zprávy o finanční inkluzi",
    },
    fi: {
      stayInformed: "Pysy ajan tasalla",
      selectLanguage: "Valitse kieli",
      newsTitle: "Rahoituksellisen osallisuuden uutiset",
    },
    hu: {
      stayInformed: "Maradjon tájékozott",
      selectLanguage: "Válasszon nyelvet",
      newsTitle: "Pénzügyi befogadás hírek",
    },
    id: {
      stayInformed: "Tetap Terinformasi",
      selectLanguage: "Pilih Bahasa",
      newsTitle: "Berita Inklusi Keuangan",
    },
    ko: {
      stayInformed: "정보를 받아보세요",
      selectLanguage: "언어 선택",
      newsTitle: "금융 포용 뉴스",
    },
    sk: {
      stayInformed: "Zostaňte informovaní",
      selectLanguage: "Vyberte jazyk",
      newsTitle: "Správy o finančnej inklúzii",
    },
    th: {
      stayInformed: "รับข้อมูลข่าวสาร",
      selectLanguage: "เลือกภาษา",
      newsTitle: "ข่าวการรวมทางการเงิน",
    },
    pt: {
      stayInformed: "Fique informado",
      selectLanguage: "Selecionar idioma",
      newsTitle: "Notícias de inclusão financeira",
    },
    ru: {
      stayInformed: "Будьте в курсе",
      selectLanguage: "Выберите язык",
      newsTitle: "Новости финансовой инклюзии",
    },
  };

  const t = translations.hasOwnProperty(selectedLanguage)
    ? translations[selectedLanguage]
    : translations["en"];

  return (
    <View style={styles.gradientBg}>
      <View style={styles.bannerContainer}>
        <Image
          source={require("../../assets/images/news-icon.png")}
          style={styles.bannerIcon}
        />
        <Text style={styles.bannerText}>{t.stayInformed}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.dropdownLabel}>{t.selectLanguage}</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedLanguage}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
            dropdownIconColor="#008080"
          >
            {languages.map((lang) => (
              <Picker.Item
                key={lang.value}
                label={lang.label}
                value={lang.value}
              />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{t.newsTitle}</Text>
        {loading && articles.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#008080"
            style={{ marginTop: 30 }}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={articles}
            renderItem={renderArticle}
            keyExtractor={(item, idx) => item.url + idx}
            contentContainerStyle={styles.articlesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              hasMore ? (
                loadingMore ? (
                  <ActivityIndicator
                    size="small"
                    color="#008080"
                    style={{ marginVertical: 16 }}
                  />
                ) : (
                  <Animated.View
                    style={{ transform: [{ scale: loadMoreScale }] }}
                  >
                    <TouchableOpacity
                      style={styles.loadMoreBtn}
                      onPress={handleLoadMore}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.loadMoreText}>Load More</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(Math.max(SCREEN_WIDTH * 0.8, 280), 500); // At least 80% of screen, min 280px, max 500px
const ARTICLE_ROW_WIDTH = Math.min(Math.max(SCREEN_WIDTH * 0.8, 280), 500); // Match card/content width

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    backgroundColor: "#e0f7fa",
    padding: 0,
    alignItems: "center",
  },
  bannerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 16,
    flexDirection: "row",
  },
  bannerIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: "contain",
  },
  bannerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008080",
    letterSpacing: 1,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 8,
  },
  pickerWrapper: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#b2dfdb",
    backgroundColor: "#f5f5f5",
  },
  picker: {
    width: "100%",
    height: Platform.OS === "ios" ? 120 : 44,
    color: "#008080",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    width: CARD_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  loadingIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#008080",
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  articlesList: {
    paddingBottom: 30,
    alignItems: "center",
    width: "100%",
  },
  articleRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "flex-start",
    width: ARTICLE_ROW_WIDTH,
    alignSelf: "center",
  },
  articleImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  articleContent: {
    flex: 1,
    justifyContent: "center",
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 4,
  },
  articleDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  articleMeta: {
    fontSize: 12,
    color: "#888",
  },
  loadMoreBtn: {
    marginVertical: 20,
    alignSelf: "center",
    backgroundColor: "#008080",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default NewsScreen;
