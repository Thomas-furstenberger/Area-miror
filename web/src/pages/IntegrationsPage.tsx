import { motion } from 'framer-motion';
import { Search, Filter, ArrowRight, Check, Zap, Star, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = [
  { id: 'all', name: 'Toutes', count: 45 },
  { id: 'communication', name: 'Communication', count: 12 },
  { id: 'productivity', name: 'Productivité', count: 15 },
  { id: 'development', name: 'Développement', count: 8 },
  { id: 'marketing', name: 'Marketing', count: 6 },
  { id: 'analytics', name: 'Analytics', count: 4 },
];

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Automatisez vos workflows de développement avec les événements GitHub.',
    category: 'development',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    color: '#181717',
    triggers: ['Push', 'Pull Request', 'Issue', 'Release', 'Star'],
    actions: ['Create Issue', 'Create Comment', 'Merge PR'],
    popular: true,
    docsUrl: '/docs/integrations/github',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Envoyez des messages et gérez votre serveur Discord automatiquement.',
    category: 'communication',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
      </svg>
    ),
    color: '#5865F2',
    triggers: ['Message reçu', 'Membre rejoint', 'Réaction ajoutée'],
    actions: ['Envoyer message', 'Envoyer embed', 'Ajouter rôle'],
    popular: true,
    docsUrl: '/docs/integrations/discord',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Automatisez la gestion de vos emails et notifications.',
    category: 'communication',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#EA4335">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
    color: '#EA4335',
    triggers: ['Nouvel email', 'Email avec label', 'Email de contact'],
    actions: ['Envoyer email', 'Créer brouillon', 'Ajouter label'],
    popular: true,
    docsUrl: '/docs/integrations/gmail',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: "Connectez Slack pour des notifications et des workflows d'équipe.",
    category: 'communication',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path
          fill="#E01E5A"
          d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
        />
        <path
          fill="#36C5F0"
          d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
        />
        <path
          fill="#2EB67D"
          d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.521 2.522v6.312z"
        />
        <path
          fill="#ECB22E"
          d="M15.165 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.521-2.522v-2.522h2.521zm0-1.27a2.528 2.528 0 0 1-2.521-2.522 2.528 2.528 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z"
        />
      </svg>
    ),
    color: '#4A154B',
    triggers: ['Message dans channel', 'Mention', 'Réaction emoji'],
    actions: ['Envoyer message', 'Créer channel', 'Uploader fichier'],
    popular: true,
    docsUrl: '/docs/integrations/slack',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Synchronisez vos bases de données et pages Notion.',
    category: 'productivity',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.495-.933l-4.577-7.186v6.952l1.447.327s0 .84-1.168.84l-3.22.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM2.222 1.061l13.632-.933c1.634-.14 2.054-.047 3.081.7l4.24 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.746-.793-1.306-.793-1.96V2.667c0-.84.374-1.54 1.135-1.606z" />
      </svg>
    ),
    color: '#000000',
    triggers: ['Page créée', 'Base de données modifiée', 'Propriété changée'],
    actions: ['Créer page', 'Ajouter item', 'Mettre à jour propriété'],
    popular: true,
    docsUrl: '/docs/integrations/notion',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Automatisez vos feuilles de calcul et rapports.',
    category: 'productivity',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path fill="#0F9D58" d="M11 11v5h2v-5h-2zm-4 0v5h2v-5H7zm8 0v5h2v-5h-2z" />
        <path
          fill="#0F9D58"
          d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
        />
      </svg>
    ),
    color: '#0F9D58',
    triggers: ['Nouvelle ligne', 'Cellule modifiée', 'Formulaire soumis'],
    actions: ['Ajouter ligne', 'Mettre à jour cellule', 'Créer feuille'],
    popular: false,
    docsUrl: '/docs/integrations/google-sheets',
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Gérez vos tableaux et cartes Trello automatiquement.',
    category: 'productivity',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0079BF">
        <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
      </svg>
    ),
    color: '#0079BF',
    triggers: ['Carte créée', 'Carte déplacée', 'Date limite atteinte'],
    actions: ['Créer carte', 'Déplacer carte', 'Ajouter commentaire'],
    popular: false,
    docsUrl: '/docs/integrations/trello',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Synchronisez vos tickets et sprints Jira.',
    category: 'development',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0052CC">
        <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.005 1.005 0 0 0 23.013 0z" />
      </svg>
    ),
    color: '#0052CC',
    triggers: ['Issue créée', 'Status changé', 'Sprint démarré'],
    actions: ['Créer issue', 'Assigner issue', 'Ajouter commentaire'],
    popular: false,
    docsUrl: '/docs/integrations/jira',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Automatisez vos workflows de paiement et facturation.',
    category: 'analytics',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#635BFF">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
      </svg>
    ),
    color: '#635BFF',
    triggers: ['Paiement réussi', 'Abonnement créé', 'Remboursement'],
    actions: ['Créer facture', 'Envoyer reçu', 'Mettre à jour client'],
    popular: false,
    docsUrl: '/docs/integrations/stripe',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Synchronisez vos événements et rappels.',
    category: 'productivity',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22 6c0-1.1-.9-2-2-2h-4V2h-2v2H10V2H8v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 14H4V10h16v10z"
        />
        <path fill="#EA4335" d="M4 10h16v10H4z" opacity=".3" />
        <rect fill="#34A853" x="6" y="12" width="4" height="4" />
        <rect fill="#FBBC05" x="14" y="12" width="4" height="4" />
      </svg>
    ),
    color: '#4285F4',
    triggers: ['Événement commence', 'Nouveau événement', 'Événement modifié'],
    actions: ['Créer événement', 'Mettre à jour événement', 'Envoyer invitation'],
    popular: false,
    docsUrl: '/docs/integrations/google-calendar',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Automatisez vos campagnes email marketing.',
    category: 'marketing',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FFE01B">
        <path d="M19.469 13.938c-.193-.091-.471-.163-.743-.2-.179-.025-.367-.03-.537-.013a7.17 7.17 0 0 0-.282-.755c.39-.234.616-.448.755-.645.153-.219.177-.397.14-.525-.025-.086-.11-.2-.323-.193-.26.01-.558.15-.841.386a4.39 4.39 0 0 0-.406-.47 2.37 2.37 0 0 1 .284-1.016 1.31 1.31 0 0 1 .48-.498c.096-.05.167-.06.22-.038.123.057.169.256.133.576-.023.205-.078.445-.168.696a.227.227 0 0 0 .129.289.228.228 0 0 0 .287-.138c.165-.455.218-.839.149-1.132-.053-.226-.18-.4-.363-.48a.65.65 0 0 0-.596.044c-.28.162-.51.423-.668.755-.16.338-.225.68-.193.99-.227.15-.455.287-.638.424-.233.173-.397.345-.488.508a.672.672 0 0 0-.063.537c.046.147.163.273.34.362.27.136.662.192 1.114.192.09 0 .183-.003.279-.01.129.205.238.417.322.632-.23.067-.45.152-.648.252-.547.278-.848.626-.893.996-.024.204.031.394.164.57.162.216.439.38.806.456.173.036.363.054.563.054.37 0 .775-.065 1.167-.197.45-.15.88-.376 1.148-.701.149-.18.236-.374.247-.57.01-.177-.045-.345-.162-.495-.169-.217-.476-.378-.84-.477zm-.952 1.313c-.322.153-.715.252-1.093.289a1.975 1.975 0 0 1-.94-.082c-.213-.076-.3-.178-.317-.26-.024-.111.074-.289.313-.423.175-.098.396-.172.643-.219.043.164.101.324.17.48.158.38.406.57.692.57a.6.6 0 0 0 .158-.02.227.227 0 0 0 .163-.276.227.227 0 0 0-.277-.163.168.168 0 0 1-.08.012c-.054-.008-.139-.063-.242-.32a3.39 3.39 0 0 1-.141-.396c.25-.024.508-.01.748.046.225.053.37.126.443.193.034.031.044.06.041.093-.006.074-.092.207-.281.376z" />
      </svg>
    ),
    color: '#FFE01B',
    triggers: ['Nouvel abonné', 'Campagne envoyée', 'Désabonnement'],
    actions: ['Ajouter abonné', 'Envoyer campagne', 'Tagger contact'],
    popular: false,
    docsUrl: '/docs/integrations/mailchimp',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connectez votre CRM et automatisez vos ventes.',
    category: 'marketing',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FF7A59">
        <path d="M18.164 7.93V5.084a2.198 2.198 0 0 0 1.267-1.984v-.066A2.198 2.198 0 0 0 17.235.836h-.067a2.198 2.198 0 0 0-2.198 2.198v.066c0 .907.55 1.685 1.334 2.02v2.81a6.27 6.27 0 0 0-2.932 1.323L6.406 4.32a2.5 2.5 0 1 0-.79 1.238l6.79 4.836a6.268 6.268 0 0 0-.903 3.26c0 1.225.35 2.37.956 3.342l-2.19 2.2a1.967 1.967 0 0 0-.568-.093 1.983 1.983 0 1 0 1.978 1.983 1.96 1.96 0 0 0-.088-.562l2.18-2.19a6.279 6.279 0 1 0 4.393-10.404zm0 10.083a3.817 3.817 0 1 1 0-7.634 3.817 3.817 0 0 1 0 7.634z" />
      </svg>
    ),
    color: '#FF7A59',
    triggers: ['Contact créé', 'Deal gagné', 'Formulaire soumis'],
    actions: ['Créer contact', 'Mettre à jour deal', 'Envoyer email'],
    popular: false,
    docsUrl: '/docs/integrations/hubspot',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'Automatisez votre présence sur Twitter.',
    category: 'marketing',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: '#000000',
    triggers: ['Nouveau tweet', 'Mention', 'Nouveau follower'],
    actions: ['Publier tweet', 'Envoyer DM', 'Liker tweet'],
    popular: false,
    docsUrl: '/docs/integrations/twitter',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Synchronisez vos fichiers et dossiers Dropbox.',
    category: 'productivity',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0061FF">
        <path d="M12 6.134L6 9.804l6 3.67 6-3.67-6-3.67zM6 14.134l6 3.67 6-3.67-6-3.67-6 3.67zm6-10L6 7.804l-6-3.67 6-3.67 6 3.67zm-6 10l-6-3.67 6-3.67 6 3.67-6 3.67zm6-6.67l6-3.67 6 3.67-6 3.67-6-3.67zm6 6.67l6-3.67-6-3.67-6 3.67 6 3.67z" />
      </svg>
    ),
    color: '#0061FF',
    triggers: ['Fichier ajouté', 'Fichier modifié', 'Dossier partagé'],
    actions: ['Uploader fichier', 'Créer dossier', 'Partager lien'],
    popular: false,
    docsUrl: '/docs/integrations/dropbox',
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'Créez des intégrations personnalisées avec des webhooks.',
    category: 'development',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ),
    color: '#6366F1',
    triggers: ['Requête HTTP reçue', 'Payload JSON', 'Header spécifique'],
    actions: ['Envoyer requête', 'POST/GET/PUT', 'Headers personnalisés'],
    popular: true,
    docsUrl: '/docs/integrations/webhooks',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Recevez des alertes sur vos métriques importantes.',
    category: 'analytics',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#E37400">
        <path d="M22.84 2.998v17.997c0 .016-.002.031-.002.047a3 3 0 0 1-5.998.047V2.998a3 3 0 1 1 6 0zM13.5 11.998v9.044a3 3 0 1 1-6 0v-9.044a3 3 0 1 1 6 0zM4.16 17.998a3 3 0 1 1-4.16 2.748 2.99 2.99 0 0 1 4.16-2.748z" />
      </svg>
    ),
    color: '#E37400',
    triggers: ['Seuil atteint', 'Rapport quotidien', 'Anomalie détectée'],
    actions: ['Créer rapport', 'Envoyer alerte', 'Exporter données'],
    popular: false,
    docsUrl: '/docs/integrations/google-analytics',
  },
];

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="container mx-auto px-6 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Plus de 500 intégrations</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-text mb-6"
          >
            Connectez toutes vos{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              applications
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text/60 max-w-2xl mx-auto mb-10"
          >
            Des intégrations natives avec les outils que vous utilisez déjà. Pas de code, pas de
            configuration complexe.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Rechercher une intégration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </motion.div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-6 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { value: '500+', label: 'Intégrations' },
              { value: '50M+', label: 'Automations/jour' },
              { value: '99.9%', label: 'Uptime' },
              { value: '<1s', label: 'Latence moyenne' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
              >
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-text/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto px-6 mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-text/70 border border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {category.name}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeCategory === category.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}
                >
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="container mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredIntegrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${integration.color}15` }}
                  >
                    {integration.icon}
                  </div>
                  {integration.popular && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                      <Star className="w-3 h-3 text-yellow-600" fill="currentColor" />
                      <span className="text-xs font-medium text-yellow-700">Populaire</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                  {integration.name}
                </h3>
                <p className="text-text/60 text-sm mb-4 line-clamp-2">{integration.description}</p>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-text/40 uppercase tracking-wide mb-1">
                      Triggers
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {integration.triggers.slice(0, 3).map((trigger) => (
                        <span
                          key={trigger}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text/40 uppercase tracking-wide mb-1">
                      Actions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {integration.actions.slice(0, 3).map((action) => (
                        <span
                          key={action}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    to={integration.docsUrl}
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    Documentation
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link
                    to={`/services?connect=${integration.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-text hover:text-primary transition-colors"
                  >
                    Connecter
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text/50 text-lg">
                Aucune intégration trouvée pour cette recherche.
              </p>
            </div>
          )}
        </section>

        {/* Request Integration */}
        <section className="container mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-10 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">
              Vous ne trouvez pas votre intégration ?
            </h2>
            <p className="text-text/60 mb-8 max-w-xl mx-auto">
              Demandez une nouvelle intégration et nous l'ajouterons à notre roadmap. Vous pouvez
              aussi utiliser nos webhooks pour créer vos propres connecteurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/request-integration"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Demander une intégration
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/docs/webhooks"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-text font-semibold rounded-xl hover:shadow-md transition-all"
              >
                Utiliser les webhooks
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                Pourquoi nos intégrations sont différentes
              </h2>
              <p className="text-text/60 max-w-2xl mx-auto">
                Des connecteurs fiables, rapides et faciles à configurer
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Temps réel',
                  description:
                    'Nos intégrations se déclenchent instantanément, sans délai ni polling.',
                },
                {
                  icon: Check,
                  title: 'Sans code',
                  description:
                    'Configuration visuelle en quelques clics. Pas besoin de compétences techniques.',
                },
                {
                  icon: Filter,
                  title: 'Filtres avancés',
                  description:
                    'Filtrez précisément les événements qui déclenchent vos automatisations.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
                  <p className="text-text/60">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
