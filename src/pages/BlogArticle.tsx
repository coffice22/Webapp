import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  User,
  Share2,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSEO } from "../hooks/useSEO";
import { blogArticles, blogCategories } from "../data/blogArticles";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();

  const article = useMemo(() => {
    return blogArticles.find((a) => a.slug === slug);
  }, [slug]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return blogArticles
      .filter(
        (a) => a.id !== article.id && a.category === article.category
      )
      .slice(0, 3);
  }, [article]);

  useSEO(
    article
      ? {
          title: `${article.title} | Blog Coffice`,
          description: article.excerpt,
        }
      : {}
  );

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const categoryInfo = blogCategories.find((c) => c.id === article.category) || {
    name: article.category,
    color: "bg-gray-500",
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <article className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au blog
              </Link>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 ${categoryInfo.color} text-white text-sm font-medium rounded-full`}
                >
                  {categoryInfo.name}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(article.publishedAt), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {article.readTime} min de lecture
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {article.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>

              <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {article.author}
                    </p>
                    <p className="text-sm text-gray-500">Rédacteur</p>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-700 rounded-xl transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 mb-8"
            >
              <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-ol:text-gray-600 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
                {article.content.split("\n").map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl mt-8 mb-4">
                        {trimmed.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={index} className="text-xl mt-6 mb-3">
                        {trimmed.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                    return (
                      <p key={index} className="font-semibold text-gray-900">
                        {trimmed.replace(/\*\*/g, "")}
                      </p>
                    );
                  }
                  if (trimmed.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-4">
                        {trimmed.replace("- ", "")}
                      </li>
                    );
                  }
                  if (/^\d+\./.test(trimmed)) {
                    return (
                      <li key={index} className="ml-4 list-decimal">
                        {trimmed.replace(/^\d+\.\s*/, "")}
                      </li>
                    );
                  }
                  if (trimmed.startsWith("|")) {
                    return null;
                  }

                  return <p key={index}>{trimmed}</p>;
                })}
              </div>
            </motion.div>

            {article.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
              >
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-500" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?search=${tag}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-amber-100 hover:text-amber-700 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {relatedArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-500" />
                  Articles similaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      to={`/blog/${related.slug}`}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group"
                    >
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                        {related.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {related.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
                        Lire
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogArticle;
