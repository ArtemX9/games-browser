import { useEffect, useMemo } from 'react';

import App from '@/App';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Game } from '@/store/reducers/games/types';
import { fetchGamesList } from '@/store/thunks/games';

function AppContainer() {
  const { isLoading, isError, games } = useAppSelector((state) => state.games);
  const dispatch = useAppDispatch();
  const gamesByPlatform = useMemo(
    function memoGamesList() {
      return (
        games?.reduce(
          (acc, game) => {
            acc[game.platform] ??= [];
            acc[game.platform].push(game);
            return acc;
          },
          {} as Record<string, Game[]>,
        ) ?? {}
      );
    },
    [games],
  );

  useEffect(function loadGames() {
    dispatch(
      fetchGamesList({
        limit: 0,
        offset: 0,
      }),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- dispatch is stable

  return (
    <App
      isLoading={isLoading !== false}
      isError={isError === true}
      games={gamesByPlatform}
    />
  );
}

export default AppContainer;
