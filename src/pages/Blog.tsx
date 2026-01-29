import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Calendar,
  Tag,
  Search,
  ChevronRight,
  Filter,
  User,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSEO } from "../hooks/useSEO";
import { blogArticles, blogCategories } from "../data/blogArticles";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Blog = () => {
  useSEO({
    title: "Blog - Coffice | Conseils pour entrepreneurs en Algérie",
    description:
      "Découvrez nos articles sur la création d'entreprise, la fiscalité, les startups et les démarches administratives en Algérie.",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    return blogArticles.filter((article) => {
      const matchesSearch =
        searchQuery === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === null || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryInfo = (categoryId: string) => {
    return (
      blogCategories.find((c) => c.id === categoryId) || {
        name: categoryId,
        color: "bg-gray-500",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIG9wYWNpdHk9Ii4xIiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">
                Ressources pour entrepreneurs
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Le Blog Coffice
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Guides pratiques, conseils et actualités pour les entrepreneurs
              algériens. Tout ce que vous devez savoir pour créer et gérer votre
              entreprise.
            </p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-amber-500" />
                  Catégories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                      selectedCategory === null
                        ? "bg-amber-100 text-amber-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Tous les articles
                  </button>
                  {blogCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? "bg-amber-100 text-amber-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${category.color}`}
                      />
                      {category.name}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Tags populaires
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "startup",
                      "fiscalité",
                      "création",
                      "SARL",
                      "TVA",
                      "CNAS",
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-amber-100 hover:text-amber-700 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1">
              {filteredArticles.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Aucun article trouvé
                  </h3>
                  <p className="text-gray-600">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredArticles.map((article, index) => {
                    const categoryInfo = getCategoryInfo(article.category);
                    return (
                      <motion.article
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                      >
                        <Link
                          to={`/blog/${article.slug}`}
                          className="block p-6 md:p-8"
                        >
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span
                              className={`px-3 py-1 ${categoryInfo.color} text-white text-xs font-medium rounded-full`}
                            >
                              {categoryInfo.name}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {format(
                                new Date(article.publishedAt),
                                "dd MMM yyyy",
                                { locale: fr },
                              )}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {article.readTime} min de lecture
                            </span>
                          </div>

                          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                            {article.title}
                          </h2>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-amber-600" />
                              </div>
                              <span className="text-sm text-gray-600">
                                {article.author}
                              </span>
                            </div>

                            <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-sm hover:gap-2 transition-all">
                              Lire l'article
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>

                          {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                              {article.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
