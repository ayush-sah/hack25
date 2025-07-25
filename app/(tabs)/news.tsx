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
  TextInput,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/context";
import axios from "axios";

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

const NEWS_API_KEY = "de661e8b71bd4a4d8ed99ecc6c70edbf";
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("finance");
  const { isAuthenticated } = useAuth();
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [financeTip, setFinanceTip] = useState("");
  const [tipLoading, setTipLoading] = useState(false);

  // Gemini API config
  const bearerToken = "AIzaSyD6cJhxDKJSV90zYjPqq46FgFTQrSViLhU"; // Replace with your Gemini API key
  const apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  // Fetch a single finance tip when user logs in
  const fetchFinanceTip = React.useCallback(() => {
    setFinanceTip("");
    setTipLoading(true);
    const randomizer = Math.floor(Math.random() * 1000000);
    const prompt = `Give only one very short (1-2 line), practical tip that increases the financial knowledge of a layman. The tip should be creative, actionable, and easy to understand. Do not return a list or multiple tips, just one. (Session: ${randomizer}) Answer in English.`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": `${bearerToken}`,
      },
    };
    const payload = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: {
            text: prompt,
          },
        },
      ],
      generationConfig: {
        temperature: 1.08,
        topP: 0.3,
        topK: 40,
        candidateCount: 1,
        maxOutputTokens: 200,
        presencePenalty: 1.0,
        frequencyPenalty: -1.0,
        responseMimeType: "text/plain",
      },
    });
    axios
      .post(apiUrl, payload, config)
      .then((response) => {
        const responseData = response.data;
        const textContent =
          responseData.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No tip available.";
        setFinanceTip(textContent);
      })
      .catch(() => {
        setFinanceTip("Sorry, could not fetch tip. Try again later.");
      })
      .finally(() => setTipLoading(false));
  }, [bearerToken, apiUrl]);

  React.useEffect(() => {
    if (isAuthenticated) {
      setTipModalVisible(true);
      fetchFinanceTip();
    }
  }, [isAuthenticated, fetchFinanceTip]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search == "") {
        setDebouncedSearch("finance");
      } else {
        setDebouncedSearch(search);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchArticles(1, true);
  }, [selectedLanguage, debouncedSearch]);

  const fetchArticles = async (pageToFetch: number, reset: boolean = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const url = `${NEWS_API_URL}?q=${debouncedSearch}&language=${selectedLanguage}&pageSize=${ARTICLES_PER_PAGE}&page=${pageToFetch}&apiKey=${NEWS_API_KEY}`;
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
      setError(
        translations[selectedLanguage]?.loadError ||
          translations["en"].loadError
      );
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
    {
      stayInformed: string;
      selectLanguage: string;
      newsTitle: string;
      loadError: string;
    }
  > = {
    en: {
      stayInformed: "Stay Informed",
      selectLanguage: "Select Language",
      newsTitle: "Financial News",
      loadError: "Could not load news articles.",
    },
    de: {
      stayInformed: "Bleiben Sie informiert",
      selectLanguage: "Sprache auswählen",
      newsTitle: "Finanznachrichten",
      loadError: "Nachrichtenartikel konnten nicht geladen werden.",
    },
    es: {
      stayInformed: "Mantente informado",
      selectLanguage: "Seleccionar idioma",
      newsTitle: "Noticias financieras",
      loadError: "No se pudieron cargar las noticias.",
    },
    fr: {
      stayInformed: "Restez informé",
      selectLanguage: "Choisir la langue",
      newsTitle: "Actualités financières",
      loadError: "Impossible de charger les articles de presse.",
    },
    hi: {
      stayInformed: "सूचित रहें",
      selectLanguage: "भाषा चुनें",
      newsTitle: "वित्तीय समाचार",
      loadError: "समाचार लोड नहीं हो सके।",
    },
    zh: {
      stayInformed: "保持关注",
      selectLanguage: "选择语言",
      newsTitle: "金融新闻",
      loadError: "无法加载新闻文章。",
    },
    bn: {
      stayInformed: "সতর্ক থাকুন",
      selectLanguage: "ভাষা নির্বাচন করুন",
      newsTitle: "আর্থিক সংবাদ",
      loadError: "সংবাদ লোড করা যায়নি।",
    },
    jp: {
      stayInformed: "最新情報を入手",
      selectLanguage: "言語を選択",
      newsTitle: "金融ニュース",
      loadError: "ニュース記事を読み込めませんでした。",
    },
    tr: {
      stayInformed: "Haberdar Olun",
      selectLanguage: "Dil Seçin",
      newsTitle: "Finans Haberleri",
      loadError: "Haberler yüklenemedi.",
    },
    cz: {
      stayInformed: "Zůstaňte informováni",
      selectLanguage: "Vyberte jazyk",
      newsTitle: "Finanční zprávy",
      loadError: "Nelze načíst zprávy.",
    },
    fi: {
      stayInformed: "Pysy ajan tasalla",
      selectLanguage: "Valitse kieli",
      newsTitle: "Rahoitusuutiset",
      loadError: "Uutisia ei voitu ladata.",
    },
    hu: {
      stayInformed: "Maradjon tájékozott",
      selectLanguage: "Válasszon nyelvet",
      newsTitle: "Pénzügyi hírek",
      loadError: "A híreket nem sikerült betölteni.",
    },
    id: {
      stayInformed: "Tetap Terinformasi",
      selectLanguage: "Pilih Bahasa",
      newsTitle: "Berita Keuangan",
      loadError: "Berita tidak dapat dimuat.",
    },
    ko: {
      stayInformed: "정보를 받아보세요",
      selectLanguage: "언어 선택",
      newsTitle: "금융 뉴스",
      loadError: "뉴스 기사를 불러올 수 없습니다.",
    },
    sk: {
      stayInformed: "Zostaňte informovaní",
      selectLanguage: "Vyberte jazyk",
      newsTitle: "Finančné správy",
      loadError: "Nepodarilo sa načítať správy.",
    },
    th: {
      stayInformed: "รับข้อมูลข่าวสาร",
      selectLanguage: "เลือกภาษา",
      newsTitle: "ข่าวการเงิน",
      loadError: "ไม่สามารถโหลดข่าวได้",
    },
    pt: {
      stayInformed: "Fique informado",
      selectLanguage: "Selecionar idioma",
      newsTitle: "Notícias financeiras",
      loadError: "Não foi possível carregar as notícias.",
    },
    ru: {
      stayInformed: "Будьте в курсе",
      selectLanguage: "Выберите язык",
      newsTitle: "Финансовые новости",
      loadError: "Не удалось загрузить новости.",
    },
  };

  const t = translations.hasOwnProperty(selectedLanguage)
    ? translations[selectedLanguage]
    : translations["en"];

  return (
    <View style={styles.gradientBg}>
      {/* Finance Tip Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={tipModalVisible}
        onRequestClose={() => setTipModalVisible(false)}
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
              borderRadius: 20,
              padding: 28,
              width: 340,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              style={{
                backgroundColor: "#e0f7fa",
                borderRadius: 50,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Image
                source={require("../../assets/images/news-icon.png")}
                style={{ width: 40, height: 40 }}
              />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#008080",
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              Finance Tip
            </Text>
            {tipLoading ? (
              <ActivityIndicator
                size="large"
                color="#008080"
                style={{ marginVertical: 24 }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  color: "#222",
                  marginBottom: 24,
                  textAlign: "center",
                  fontWeight: "500",
                  lineHeight: 26,
                }}
              >
                {financeTip.split(/(\*[^*]+\*)/g).map((part, idx) => {
                  if (/^\*[^*]+\*$/.test(part)) {
                    return (
                      <Text
                        key={idx}
                        style={{ fontWeight: "bold", color: "#008080" }}
                      >
                        {part.slice(1, -1)}
                      </Text>
                    );
                  }
                  return part;
                })}
              </Text>
            )}
            <TouchableOpacity
              style={{
                backgroundColor: "#008080",
                paddingHorizontal: 36,
                paddingVertical: 12,
                borderRadius: 24,
                shadowColor: "#008080",
                shadowOpacity: 0.18,
                shadowRadius: 6,
                elevation: 2,
              }}
              onPress={() => setTipModalVisible(false)}
              activeOpacity={0.85}
              disabled={tipLoading}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                  letterSpacing: 0.2,
                }}
              >
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
            dropdownIconColor="rgb(0, 128, 128)"
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
        <TextInput
          style={styles.searchInput}
          placeholder="Search news..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{t.newsTitle}</Text>
        {loading && articles.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="rgb(0, 128, 128)"
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
                    color="rgb(0, 128, 128)"
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
    backgroundColor: "#F8F9FA",
    padding: 0,
    alignItems: "center",
  },
  bannerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60, // Increased top margin for better spacing
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
    color: "rgb(0, 128, 128)",
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
    color: "rgb(0, 128, 128)",
    marginBottom: 8,
  },
  pickerWrapper: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgb(0, 128, 128)",
    backgroundColor: "#f5f5f5",
  },
  picker: {
    width: "100%",
    height: Platform.OS === "ios" ? 120 : 44,
    color: "rgb(0, 128, 128)",
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
    color: "rgb(0, 128, 128)",
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "rgb(0, 128, 128)",
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
    color: "rgb(0, 128, 128)",
    marginBottom: 4,
  },
  articleDescription: {
    fontSize: 14,
    color: "#222",
    marginBottom: 6,
  },
  articleMeta: {
    fontSize: 12,
    color: "#888",
  },
  loadMoreBtn: {
    marginVertical: 20,
    alignSelf: "center",
    backgroundColor: "rgb(0, 128, 128)",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchInput: {
    width: "100%",
    height: 40,
    borderColor: "rgb(0, 128, 128)",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "#f5f5f5",
    color: "#222",
    fontSize: 16,
  },
});

export default NewsScreen;
