# Développement d'une application web de visualisation et de manipulation fragments de documents ancients
Encadrant : A. Pirrone
Contacts : antoine.pirrone@labri.fr

Sujet
Dans le cadre d'un projet de recherche concernant la reconstitution automatique ou semi-automatique de fragments de documents ancients numérisés, nous souhaiterions proposer aux archéologues une interface utilisateur (web) leurs permettant de visualiser et de manipuler les fragments, ainsi que d'appliquer les algorithmes développés (pour info : segmentation, recalement recto/verso, extraction de lignes, détection de contours ... Le tout sous la forme d'une pipeline de traîtements visant à assembler les fragments automatiquement si possible, ou proposer un sous ensemble de candidats potentiels).

La plateforme devra gérer correctement la base de données de fragments, comprenant pour chaque fragment 4 images (recto/verso, en couleurs et en infra rouges), ainsi que les métadonnées associées à chacuns de ces fragments. Elle devra être capable d'appeler des traitements fournis sur les données, d'en afficher les résultats (de permettre de les manipuler le cas échéant) et de les sauvegarder.

Optionel : Proposer une interface pour renseigner les metadonnées ? (actuellement les archéologues le font à la main, directement dans le xml 
