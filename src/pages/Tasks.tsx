import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setBoards, setSelectedBoardId } from '../store/slices/taskSlice';
import { Board } from '../types/content';
import TaskBoard from '../components/TaskBoard';
import BoardsOverview from '../components/BoardsOverview';
import { IoArrowBackSharp } from "react-icons/io5";
import { motion } from 'framer-motion';
import { listenToBoards, createDefaultBoardIfNeeded } from '../services/TaskServics';

const Tasks = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { boards, selectedBoardId, loading } = useSelector((state: RootState) => state.tasks);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all boards
  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    let mounted = true;

    const unsubscribe = listenToBoards(
      user.uid,
      (fetchedBoards) => {
        if (!mounted) return;
        createDefaultBoardIfNeeded(user.uid).then((data) => {
          dispatch(setBoards(fetchedBoards));
          setIsLoading(false);
        })
      },
      () => {
        console.error('Error fetching boards');
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [dispatch, user?.uid]);

  const handleSelectBoard = (boardId: string) => {
    dispatch(setSelectedBoardId(boardId));
  };

  const handleBackToOverview = () => {
    dispatch(setSelectedBoardId(null));
  };

  const refreshBoards = () => {
    // Boards are refreshed automatically via onSnapshot
  };

  const getSortedBoards = (boards: Board[]): Board[] => {
    const boardWithPosition = boards.map(board => ({
      ...board,
      position: typeof board.position === 'number' ? board.position : 0
    }));
    return boardWithPosition.sort((a, b) => a.position - b.position);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent animate-spin"></div>
          <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-blue-400 animate-spin animation-delay-150"></div>
          <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-500 border-l-transparent animate-spin animation-delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {selectedBoardId ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <div className="group relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToOverview}
                  className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 p-2 rounded-md text-gray-800 hover:text-blue-600 transition-colors duration-200"
                  aria-label="Back to boards overview"
                >
                  <IoArrowBackSharp size={22} />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">
                  {boards.find(b => b.id === selectedBoardId)?.title || 'Board'}
                </span>
                {boards.find(b => b.id === selectedBoardId)?.isDefault && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </h2>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div>
              <TaskBoard />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white">
          <BoardsOverview
            boards={getSortedBoards(boards)}
            onSelectBoard={handleSelectBoard}
            onRefresh={refreshBoards}
          />
        </div>
      )}
    </div>
  );
};

export default Tasks; 