# Configuration Gmail pour l'envoi d'emails

Ce guide vous explique comment configurer Gmail pour envoyer des emails OTP depuis FlowState.

## Étapes pour obtenir un App Password Gmail

### 1. Activer la validation en deux étapes

1. Allez sur [Google Account Security](https://myaccount.google.com/security)
2. Sous "Signing in to Google", cliquez sur **2-Step Verification**
3. Suivez les instructions pour activer la validation en deux étapes
4. Vous devrez confirmer avec votre téléphone

### 2. Générer un App Password

1. Une fois la validation en deux étapes activée, retournez sur [Google Account Security](https://myaccount.google.com/security)
2. Sous "Signing in to Google", vous verrez maintenant **App passwords**
3. Cliquez sur **App passwords**
4. Sélectionnez **Mail** comme application
5. Sélectionnez **Other (Custom name)** comme appareil
6. Entrez "FlowState Backend" comme nom
7. Cliquez sur **Generate**
8. Google vous donnera un mot de passe de 16 caractères (sans espaces)
   - Exemple: `abcd efgh ijkl mnop` → utilisez `abcdefghijklmnop`

### 3. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env`:

```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Important:**
- `GMAIL_USER` = votre adresse Gmail complète
- `GMAIL_APP_PASSWORD` = le mot de passe de 16 caractères généré (sans espaces)

### 4. Vérifier la configuration

Une fois configuré, le service email utilisera automatiquement ces credentials pour envoyer:
- Emails OTP de vérification
- Emails de bienvenue

## Dépannage

### Erreur: "Invalid login"
- Vérifiez que la validation en deux étapes est activée
- Vérifiez que vous utilisez l'App Password (16 caractères) et non votre mot de passe Gmail normal
- Assurez-vous qu'il n'y a pas d'espaces dans l'App Password

### Erreur: "Less secure app access"
- Les App Passwords remplacent l'ancien système "Less secure app access"
- Si vous voyez cette erreur, assurez-vous d'utiliser un App Password récent

### L'email n'arrive pas
- Vérifiez le dossier spam
- Vérifiez que l'adresse email de destination est correcte
- Vérifiez les logs du backend pour voir les erreurs détaillées

## Alternative: Utiliser un service d'email professionnel

Pour la production, considérez utiliser:
- **SendGrid** (gratuit jusqu'à 100 emails/jour)
- **Mailgun** (gratuit jusqu'à 1000 emails/mois)
- **AWS SES** (très économique)
- **Resend** (moderne et simple)

Ces services offrent de meilleures garanties de délivrabilité et des statistiques détaillées.

