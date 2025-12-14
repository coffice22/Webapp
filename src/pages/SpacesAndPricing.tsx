import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Users, Wifi, Coffee, Presentation, Volume2, PenTool,
  Monitor, Clock, Star, Zap, Shield, TrendingUp, Calendar, Check,
  ChevronRight, Sparkles, Gift, Target, Headphones, Building2
} from 'lucide-react'
import { useSEO } from '../hooks/useSEO'

const SpacesAndPricing = () => {
  useSEO({
    title: 'Espaces & Tarifs | Coffice Coworking Alger',
    description: 'Découvrez nos espaces de coworking (200m²) et nos formules d\'abonnement flexibles. Private booths, salle de réunion et tarifs adaptés aux entrepreneurs.'
  })

  const [activeSpace, setActiveSpace] = useState<string>('coworking')

  // ============ ESPACES ============
  const spaces = [
    {
      id: 'coworking',
      name: 'Espace Coworking',
      tagline: 'Votre bureau flexible au coeur d\'Alger',
      description: 'Un environnement dynamique de 200m² avec 24 postes open space',
      image: '/espace-coworking.jpeg',
      price: '1 200 DA TTC / jour',
      priceValue: 1200,
      period: 'jour',
      priceFullDay: '1 200 DA TTC',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        { icon: Users, text: '24 postes open space' },
        { icon: Wifi, text: 'WiFi haut débit' },
        { icon: Coffee, text: 'Café, thé et collations disponibles' },
        { icon: Monitor, text: '2 postes informatiques puissants' },
        { icon: Zap, text: 'Prises électriques et USB à chaque poste' },
        { icon: Shield, text: 'Casiers de rangement sécurisés' }
      ],
      stats: [
        { label: 'Postes disponibles', value: '24' },
        { label: 'Capacité max', value: '24 pers.' },
        { label: 'Surface', value: '200m²' }
      ]
    },
    {
      id: 'meeting',
      name: 'Salle de Réunion',
      tagline: 'L\'espace parfait pour vos rencontres pros',
      description: 'Équipée pour vos présentations, formations et réunions d\'équipe',
      image: '/reception.jpeg',
      price: '2 500 DA TTC / heure',
      priceValue: 2500,
      period: 'heure',
      priceHour: '2 500 DA TTC',
      priceHalfDay: '7 000 DA TTC',
      priceFullDay: '12 000 DA TTC',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      features: [
        { icon: Users, text: 'Jusqu\'à 12 personnes' },
        { icon: Presentation, text: 'TV 75" et tableau blanc' },
        { icon: Volume2, text: 'Système audio professionnel' },
        { icon: PenTool, text: 'Tableau blanc interactif' },
        { icon: Presentation, text: 'Système visioconférence HD' },
        { icon: Coffee, text: 'Service café et eau minérale' }
      ],
      stats: [
        { label: 'Capacité', value: '12 pers.' },
        { label: 'Écran', value: '75"' },
        { label: 'Terrasse', value: 'Privée' }
      ]
    },
    {
      id: 'booths',
      name: 'Private Booths',
      tagline: 'Bureaux privés pour concentration maximale',
      description: '3 espaces privatifs pour 2 à 4 personnes : Aurès et Atlas (6m² chacun pour 2-4 personnes) et Hoogar (5m² pour 2 personnes)',
      image: '/espace-coworking-boxes.jpeg',
      price: 'À partir de 5 000 DA TTC',
      priceValue: 5000,
      period: 'jour',
      color: 'from-violet-500 to-purple-500',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
      features: [
        { icon: Building2, text: 'Aurès : 6m² pour 2-4 personnes' },
        { icon: Building2, text: 'Atlas : 6m² pour 2-4 personnes' },
        { icon: Building2, text: 'Hoogar : 5m² pour 2 personnes' },
        { icon: Shield, text: 'Espaces 100% privés et sécurisés' },
        { icon: Wifi, text: 'WiFi dédié très haut débit' },
        { icon: Monitor, text: 'Écran et mobilier premium' }
      ],
      stats: [
        { label: 'Booths disponibles', value: '3' },
        { label: 'Capacité totale', value: '10 pers.' },
        { label: 'Surface', value: '5-6m²' }
      ],
      booths: [
        {
          name: 'Aurès',
          surface: '6m²',
          capacity: '2-4 personnes',
          image: '/Espace de coworking (Box Individuels et 4 personnesl).jpeg',
          description: 'Booth spacieux idéal pour petites équipes et réunions confidentielles',
          priceFullDay: '6 000 DA TTC',
          priceHalfDay: '3 500 DA TTC'
        },
        {
          name: 'Atlas',
          surface: '6m²',
          capacity: '2-4 personnes',
          image: '/Espace de coworking (Box Individuels et 4 personnesl).jpeg',
          description: 'Espace privé confortable avec vue panoramique',
          priceFullDay: '6 000 DA TTC',
          priceHalfDay: '3 500 DA TTC'
        },
        {
          name: 'Hoogar',
          surface: '5m²',
          capacity: '2 personnes',
          image: '/Espace de coworking (Box Individuels et 4 personnesl).jpeg',
          description: 'Booth intimiste parfait pour le travail concentré ou les entretiens',
          priceFullDay: '5 000 DA TTC',
          priceHalfDay: '3 000 DA TTC'
        }
      ]
    }
  ]

  // ============ ABONNEMENTS ============
  const subscriptions = [
    {
      name: 'Solo',
      price: '14 000 DA TTC',
      priceValue: 14000,
      period: '/mois',
      description: 'Idéal pour freelances & auto-entrepreneurs',
      originalPrice: '18 000 DA',
      discount: '-22%',
      features: [
        'Open space 8h–18h',
        '15h crédit réservation',
        'WiFi haut débit',
        'Accès communauté',
        'Café et thé disponibles',
        'Casier personnel',
        'Support email'
      ],
      color: 'accent',
      popular: false,
      savings: '4 000 DA économisés'
    },
    {
      name: 'Pro',
      price: '25 000 DA TTC',
      priceValue: 25000,
      period: '/mois',
      description: 'Pour professionnels établis & consultants',
      originalPrice: '32 000 DA',
      discount: '-22%',
      features: [
        'Tous espaces 7h–20h',
        '35h crédit réservation',
        'WiFi haut débit prioritaire',
        'Salle réunion 2h/mois',
        '-25% services additionnels',
        'Support prioritaire',
        'Café et collations disponibles'
      ],
      color: 'teal',
      popular: true,
      savings: '7 000 DA économisés'
    },
    {
      name: 'Executive',
      price: '48 000 DA TTC',
      priceValue: 48000,
      period: '/mois',
      description: 'Pour équipes & entreprises',
      originalPrice: '65 000 DA',
      discount: '-26%',
      features: [
        'Accès illimité 24/7',
        '60h crédit réservation',
        'WiFi dédié très haut débit',
        'Private booth dédié',
        'Salle réunion 5h/mois',
        'Secrétariat et assistance',
        'Support premium 24/7',
        'Tous services inclus'
      ],
      color: 'warm',
      popular: false,
      savings: '17 000 DA économisés'
    }
  ]

  const activeSpaceData = spaces.find(s => s.id === activeSpace) || spaces[0]

  const benefits = [
    {
      icon: Clock,
      title: 'Flexibilité totale',
      description: 'Réservez à l\'heure, au jour, au mois selon vos besoins'
    },
    {
      icon: TrendingUp,
      title: 'Boost productivité',
      description: 'Environnement conçu pour optimiser votre efficacité'
    },
    {
      icon: Users,
      title: 'Communauté pro',
      description: 'Réseau d\'entrepreneurs et freelances actifs'
    },
    {
      icon: Star,
      title: 'Services premium',
      description: 'Équipements et accompagnement de qualité'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-primary via-accent to-teal">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Espaces & Tarifs
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              Trouvez l'espace qui vous correspond
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Coworking, salles de réunion et accompagnement complet au coeur d'Alger
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/inscription"
                className="group px-8 py-4 bg-white text-primary rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 flex items-center gap-2"
              >
                Réserver maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#tarifs"
                className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-primary transition-all"
              >
                Voir les tarifs
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            {[
              { value: '200m²', label: 'Surface totale' },
              { value: '24', label: 'Postes coworking' },
              { value: '24/7', label: 'Accès sécurisé' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Espaces Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-primary mb-4">
              Nos Espaces
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des environnements conçus pour votre réussite professionnelle
            </p>
          </motion.div>

          {/* Space Selector */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {spaces.map((space) => (
              <button
                key={space.id}
                onClick={() => setActiveSpace(space.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeSpace === space.id
                    ? `bg-gradient-to-r ${space.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {space.name}
              </button>
            ))}
          </div>

          {/* Active Space Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSpace}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Regular Spaces Display (Coworking & Meeting) */}
              {activeSpace !== 'booths' && (
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={activeSpaceData.image}
                      alt={activeSpaceData.name}
                      className="w-full h-[400px] object-cover"
                    />
                    <div className={`absolute top-4 right-4 px-4 py-2 bg-gradient-to-r ${activeSpaceData.color} text-white rounded-full font-bold`}>
                      {activeSpaceData.price}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-display font-bold text-primary mb-4">
                      {activeSpaceData.name}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {activeSpaceData.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      {activeSpaceData.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <feature.icon className={`w-5 h-5 ${activeSpaceData.textColor} mt-0.5 mr-3 flex-shrink-0`} />
                          <span className="text-gray-700">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                      {activeSpaceData.stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-2xl font-bold text-primary">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Details */}
                    {activeSpace === 'coworking' && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <h4 className="font-bold text-primary mb-3">Tarif :</h4>
                        <div className="flex justify-center items-center">
                          <span className="text-2xl font-bold text-blue-600">{activeSpaceData.priceFullDay}</span>
                        </div>
                      </div>
                    )}

                    {activeSpace === 'meeting' && (
                      <div className="mb-6 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                        <h4 className="font-bold text-primary mb-3">Tarifs de location :</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">À l'heure</span>
                            <span className="font-bold text-emerald-600">{activeSpaceData.priceHour}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Demi-journée</span>
                            <span className="font-bold text-emerald-600">{activeSpaceData.priceHalfDay}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Journée complète</span>
                            <span className="font-bold text-emerald-600">{activeSpaceData.priceFullDay}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Link
                      to="/inscription"
                      className="mt-6 inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all"
                    >
                      Réserver cet espace
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Private Booths Display */}
              {activeSpace === 'booths' && (
                <div>
                  <div className="mb-12 text-center">
                    <h3 className="text-3xl font-display font-bold text-primary mb-4">
                      {activeSpaceData.name}
                    </h3>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
                      {activeSpaceData.description}
                    </p>
                    <div className="flex justify-center gap-8 mb-8">
                      {activeSpaceData.stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-3xl font-bold text-primary">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {activeSpaceData.booths?.map((booth, idx) => (
                      <motion.div
                        key={booth.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={booth.image}
                            alt={booth.name}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute top-4 right-4 px-4 py-2 bg-gradient-to-r ${activeSpaceData.color} text-white rounded-full font-bold text-sm`}>
                            {booth.surface}
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="text-2xl font-bold text-primary mb-2">{booth.name}</h4>
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{booth.capacity}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">{booth.description}</p>

                          <div className="mb-6 p-3 bg-violet-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Journée complète</span>
                              <span className="font-bold text-violet-600">{booth.priceFullDay}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Demi-journée</span>
                              <span className="font-bold text-violet-600">{booth.priceHalfDay}</span>
                            </div>
                          </div>

                          <Link
                            to="/inscription"
                            className="block text-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                          >
                            Réserver
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-violet-50 rounded-xl border-2 border-violet-200">
                    <h4 className="font-bold text-primary mb-4 text-lg">Équipements inclus dans tous les booths :</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {activeSpaceData.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <feature.icon className={`w-5 h-5 ${activeSpaceData.textColor} mt-0.5 mr-3 flex-shrink-0`} />
                          <span className="text-gray-700 text-sm">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs Section */}
      <section id="tarifs" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-primary mb-4">
              Nos Formules d'Abonnement
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez la formule qui correspond à vos besoins et bénéficiez de tarifs préférentiels
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {subscriptions.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all ${
                  plan.popular ? 'ring-2 ring-teal scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-teal to-cyan-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Populaire
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 line-through">{plan.originalPrice}</span>
                      <span className="text-sm font-semibold text-green-600">{plan.discount}</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">{plan.savings}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start">
                        <Check className="w-5 h-5 text-teal mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/inscription"
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-teal to-cyan-500 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Choisir cette formule
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 mb-6">
              Besoin d'un forfait personnalisé pour votre équipe ?
            </p>
            <Link
              to="/inscription"
              className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              Contactez-nous pour un devis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Domiciliation CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">
            Besoin de domicilier votre entreprise ?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Service exclusif pour startups labelisées et auto-entrepreneurs dès 14 000 DA/mois
          </p>
          <Link
            to="/domiciliation"
            className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-full font-semibold hover:bg-orange-50 transition-all shadow-lg"
          >
            Découvrir la domiciliation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default SpacesAndPricing
