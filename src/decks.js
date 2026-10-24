/* Each deck is independent from the interface and may be expanded without changing the UI. */
(function registerDecks(root) {
  "use strict";

  root.StudyFlashcardsDecks = [
    {
      id: "cos512",
      title: "COS512 · Artificial Intelligence",
      description: "Assignment 3 · Naïve Bayes classification",
      cards: [
        {
          id: "training-dataset", term: "Training Dataset",
          en: "A collection of examples used to learn patterns or estimate model parameters.",
          el: "Το σύνολο παραδειγμάτων από το οποίο μαθαίνει ένα μοντέλο.",
          example: "The four labelled SMS messages are the training dataset.",
          distinction: "Training examples have known labels here; the three new messages do not."
        },
        {
          id: "class-label", term: "Class Label",
          en: "The category assigned to an example in a classification task.",
          el: "Η γνωστή ή προβλεπόμενη κατηγορία ενός παραδείγματος.",
          example: "Spam and Normal are the two class labels.",
          distinction: "A label is a category, not a probability."
        },
        {
          id: "supervised-learning", term: "Supervised Learning",
          en: "A learning approach that uses examples with known target labels to learn how to predict labels for new examples.",
          el: "Μάθηση από παραδείγματα για τα οποία γνωρίζουμε τη σωστή κατηγορία.",
          example: "The classifier learns from SMS messages already marked as Spam or Normal.",
          distinction: "Without labelled examples, this particular supervised training procedure cannot be performed."
        },
        {
          id: "classifier", term: "Classifier",
          en: "A model or decision procedure that assigns an input to one of several predefined classes.",
          el: "Μοντέλο που αποφασίζει σε ποια από τις προκαθορισμένες κατηγορίες ανήκει ένα νέο δεδομένο.",
          example: "The Naïve Bayes classifier assigns a new SMS to Spam or Normal.",
          distinction: "Naïve Bayes is the classifier; Laplace smoothing is one calculation technique used by it."
        },
        {
          id: "token", term: "Token",
          en: "A unit of text produced by tokenization, such as a word occurrence in this assignment.",
          el: "Μία επιμέρους μονάδα κειμένου — εδώ, μία εμφάνιση λέξης.",
          example: "The sentence 'Win a free iPhone' contains four word tokens.",
          distinction: "Repeated occurrences count as separate tokens, but not as separate vocabulary terms."
        },
        {
          id: "vocabulary", term: "Vocabulary",
          en: "The set of distinct tokens retained from the training corpus after preprocessing.",
          el: "Το σύνολο των διαφορετικών λέξεων που προκύπτουν από τα δεδομένα εκπαίδευσης.",
          example: "The assignment has 13 distinct vocabulary words.",
          distinction: "Vocabulary size counts unique words; total token count includes repeated words."
        },
        {
          id: "preprocessing", term: "Text Preprocessing",
          en: "The consistent preparation of text before features are extracted, such as lowercasing and removing punctuation.",
          el: "Η προετοιμασία του κειμένου πριν από τη δημιουργία των αριθμητικών χαρακτηριστικών του.",
          example: "'Hello, Win!' is converted to the tokens 'hello' and 'win'.",
          distinction: "Preprocessing choices must be applied consistently during training and classification."
        },
        {
          id: "bag-of-words", term: "Bag of Words (BoW)",
          en: "A text representation that records word occurrences without retaining their original order.",
          el: "Αριθμητική αναπαράσταση του κειμένου με βάση τις εμφανίσεις λέξεων, χωρίς τη σειρά τους.",
          example: "'Win a free iPhone' is represented by counts in the 13-word vocabulary.",
          distinction: "A standard BoW representation does not preserve word order or grammatical context."
        },
        {
          id: "feature-vector", term: "Feature Vector",
          en: "An ordered list of numerical feature values used to represent one example.",
          el: "Μια διατεταγμένη σειρά αριθμών που περιγράφει ένα παράδειγμα.",
          example: "Each SMS has a 13-dimensional vector, with one position per vocabulary word.",
          distinction: "The vector follows a fixed vocabulary order; it does not retain the SMS word order."
        },
        {
          id: "word-frequency", term: "Word Frequency",
          en: "The number of times a given word occurs in a specified collection of text.",
          el: "Πόσες φορές εμφανίζεται μια συγκεκριμένη λέξη στο εξεταζόμενο σύνολο κειμένων.",
          example: "'win' occurs twice among the Spam training messages.",
          distinction: "Word frequency counts appearances, not just how many messages contain the word."
        },
        {
          id: "prior-probability", term: "Prior Probability",
          en: "The probability assigned to a class before considering the evidence in the new input.",
          el: "Η αρχική πιθανότητα μιας κατηγορίας, πριν εξετάσουμε τις λέξεις του νέου μηνύματος.",
          example: "P(Spam) = P(Normal) = 2/4 = 0.5.",
          distinction: "A prior is about the class before observing the new message, not the final classification confidence."
        },
        {
          id: "likelihood", term: "Likelihood / Word Likelihood",
          en: "In this model, the probability of observing a particular word given a class, written P(word | class).",
          el: "Η πιθανότητα εμφάνισης μιας λέξης όταν θεωρούμε δεδομένη την κατηγορία.",
          example: "With Laplace smoothing, P(win | Spam) = (2 + 1)/(8 + 13) = 3/21.",
          distinction: "P(word | Spam) is not the same quantity as P(Spam | word)."
        },
        {
          id: "posterior", term: "Posterior Probability",
          en: "The probability of a class after taking the observed evidence into account.",
          el: "Η ενημερωμένη πιθανότητα μιας κατηγορίας αφού εξετάσουμε τις λέξεις του μηνύματος.",
          example: "The model estimates P(Spam | message) using the message's words.",
          distinction: "A model's posterior estimate is not a guarantee that the prediction is correct."
        },
        {
          id: "bayes-theorem", term: "Bayes’ Theorem",
          en: "A probability rule that updates the probability of a hypothesis using observed evidence.",
          el: "Κανόνας που συνδυάζει την αρχική πιθανότητα με τα νέα δεδομένα για να την ενημερώσει.",
          example: "P(Spam | message) is proportional to P(message | Spam) × P(Spam).",
          distinction: "Bayes’ theorem is the probability rule; Naïve Bayes is a classifier built using that rule and an independence assumption."
        },
        {
          id: "naive-bayes", term: "Naïve Bayes Classifier",
          en: "A probabilistic classifier that applies Bayes’ theorem while assuming its features are conditionally independent given the class.",
          el: "Πιθανοτικός ταξινομητής που χρησιμοποιεί το θεώρημα Bayes και την παραδοχή υπό συνθήκη ανεξαρτησίας.",
          example: "It combines word likelihoods and class priors to classify each new SMS.",
          distinction: "Naïve Bayes is not another name for Laplace smoothing."
        },
        {
          id: "conditional-independence", term: "Conditional Independence",
          en: "The assumption that features can be treated as independent once the class is known.",
          el: "Η παραδοχή ότι, αν γνωρίζουμε την κατηγορία, κάθε λέξη μπορεί να αξιολογηθεί ανεξάρτητα από τις άλλες.",
          example: "Given Spam, the model multiplies the likelihoods for 'win' and 'free' separately.",
          distinction: "Real words can be related; the assumption is a simplifying approximation."
        },
        {
          id: "multinomial", term: "Multinomial Naïve Bayes",
          en: "A Naïve Bayes variant that models the counts of discrete features, commonly word occurrences in text.",
          el: "Παραλλαγή του Naïve Bayes που αξιοποιεί πόσες φορές εμφανίζεται κάθε λέξη.",
          example: "The class has eight total word occurrences, and 'win' occurs twice in Spam.",
          distinction: "It uses token counts rather than only whether a word appears at least once."
        },
        {
          id: "laplace", term: "Laplace Smoothing (Add-One)",
          en: "An additive smoothing method that increases every vocabulary word count by one when estimating class-conditional probabilities.",
          el: "Τεχνική εξομάλυνσης που προσθέτει 1 στις συχνότητες ώστε οι γνωστές λέξεις με μηδενικές εμφανίσεις να μην πάρουν πιθανότητα μηδέν.",
          example: "P(win | Normal) = (0 + 1)/(8 + 13) = 1/21.",
          distinction: "Smoothing zero counts within the known vocabulary does not automatically solve the problem of entirely unseen words."
        },
        {
          id: "oov", term: "Out-of-Vocabulary (OOV) Word",
          en: "A word that does not appear in the model's training vocabulary.",
          el: "Λέξη που δεν περιλαμβάνεται στο λεξιλόγιο εκπαίδευσης.",
          example: "'now', 'an' and 'prize' are OOV words in the assignment.",
          distinction: "This assignment ignores OOV words; other designs can assign them an explicit unknown-word feature."
        },
        {
          id: "normalization", term: "Probability Normalization",
          en: "The process of converting nonnegative class scores into probabilities that sum to one.",
          el: "Η μετατροπή των βαθμολογιών των κατηγοριών σε πιθανότητες με συνολικό άθροισμα 1.",
          example: "The Spam score is divided by the sum of the Spam and Normal scores.",
          distinction: "The larger unnormalized score determines the winning class, even before normalization."
        }
      ]
    }
  ];
})(window);
