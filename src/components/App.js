import { CurrentUserContext } from '../contexts/CurrentUserContext';
import React from "react";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import api from "../utils/Api";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({ name: '', link: '' });
  const [currentUser, setCurrentUser] = React.useState({ name: '', about: '' });
  const [cards, setCards] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    api.getInitialCards()
      .then((result) => {
        setCards(result);
      })
      .catch((result) => {
        console.log(result);
      })
    api.getUserInfo()
      .then((result) => {
        setCurrentUser(result);
      })
      .catch((result) => {
        console.log(result);
      })
  }, []
  );

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    api.changeLikeCardStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch((result) => {
        console.log(result);
      })
  }

  function handleCardDelete(card) {
    api.deleleCard(card._id)
      .then(() => {
        setCards((state) => state.filter(c => c._id !== card._id));
      })
      .catch((result) => {
        console.log(result);
      })
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleOverlay(evt) {
    if (evt.target === evt.currentTarget) {
      closeAllPopups()
    }
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({ name: '', link: '' });
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleUpdateUser({ name, about }) {
    setIsLoading(true);
    api.updateUserInfo(name, about)
      .then((result) => {
        setCurrentUser(result);
        closeAllPopups()
      })
      .catch((result) => {
        console.log(result);
      })
      .finally(() => {
        setIsLoading(false);
      })
  }

  function handleAddPlaceSubmit({ name, link }) {
    setIsLoading(true);
    api.addUserCard(name, link)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups()
      })
      .catch((result) => {
        console.log(result);
      })
      .finally(() => {
        setIsLoading(false);
      })
  }

  function handleUpdateAvatar({ link }) {
    setIsLoading(true);
    api.updateUserAvatar(link)
      .then((result) => {
        setCurrentUser(result);
        closeAllPopups()
      })
      .catch((result) => {
        console.log(result);
      })
      .finally(() => {
        setIsLoading(false);
      })
  }

  const isOpen = isEditAvatarPopupOpen || isEditProfilePopupOpen || isAddPlacePopupOpen || selectedCard.link;

  React.useEffect(() => {
    function closeByEscape(e) {
      if (e.key === 'Escape') {
        closeAllPopups();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', closeByEscape);
      return () => {
        document.removeEventListener('keydown', closeByEscape);
      }
    }
  }, [isOpen])

  return (
    <div className="page">
      <CurrentUserContext.Provider value={currentUser}>
        <Header />
        <Main
          onEditProfile={handleEditProfileClick}
          onAddPlace={handleAddPlaceClick}
          onEditAvatar={handleEditAvatarClick}
          onCardClick={handleCardClick}
          cards={cards}
          onCardLike={handleCardLike}
          onCardDelete={handleCardDelete}
        />
        <Footer />

        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={handleOverlay} onUpdateUser={handleUpdateUser} isLoading={isLoading} />

        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={handleOverlay} onAddPlace={handleAddPlaceSubmit} isLoading={isLoading} />

        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={handleOverlay} onUpdateAvatar={handleUpdateAvatar} isLoading={isLoading} />

        <ImagePopup
          card={selectedCard}
          onClose={handleOverlay}
        />
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
