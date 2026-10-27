import { useRef } from 'react';
import './Menu.css';

export default function Menu({
  bestScore = 0,
  labels,
  onStart,
  onUserInteraction,
  onMenuAction,
  onOptions,
  onScores,
  onCredits,
}) {
  const menuButtons = useRef([]);

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      if (event.key === 'Enter' || event.key === ' ') {
        onUserInteraction?.();
      }
      return;
    }

    event.preventDefault();
    const currentIndex = menuButtons.current.indexOf(document.activeElement);
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + menuButtons.current.length) %
      menuButtons.current.length;

    menuButtons.current[nextIndex]?.focus();
  };

  const runMenuAction = (action) => {
    onMenuAction?.();
    action?.();
  };

  return (
    <main className="menu">
      <h1 className="menu__title">MIMIR</h1>

      <nav
        className="menu__list"
        aria-label="Menu principal"
        onPointerDownCapture={onUserInteraction}
        onKeyDown={handleKeyDown}
      >
        <button ref={(element) => { menuButtons.current[0] = element }} type="button" onClick={() => runMenuAction(onStart)}>{labels?.start ?? 'Commencer le jeu'}</button>
        <button ref={(element) => { menuButtons.current[1] = element }} type="button" onClick={() => runMenuAction(onOptions)}>{labels?.options ?? 'Options'}</button>
        <button ref={(element) => { menuButtons.current[2] = element }} type="button" onClick={() => runMenuAction(onScores)}>{labels?.scores ?? 'Meilleurs scores'}</button>
        <button ref={(element) => { menuButtons.current[3] = element }} type="button" onClick={() => runMenuAction(onCredits)}>{labels?.credits ?? 'Crédits'}</button>
      </nav>

      <p className="menu__best">{labels?.best ?? 'Meilleur score'} : {bestScore}</p>
    </main>
  );
}
