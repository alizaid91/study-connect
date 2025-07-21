import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setBoards, setSelectedBoardId } from "../store/slices/taskSlice";
import { Board } from "../types/content";
import TaskBoard from "../components/Task-Board/TaskBoard";
import BoardsOverview from "../components/Task-Board/BoardsOverview";
import { IoArrowBackSharp } from "react-icons/io5";
import { motion } from "framer-motion";
import {
  listenToBoards,
  createDefaultBoardIfNeeded,
} from "../services/taskServics";
import Loader1 from "../components/Loaders/Loader1";

const Tasks = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { boards, selectedBoardId } = useSelector(
    (state: RootState) => state.tasks
  );
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
        createDefaultBoardIfNeeded(user.uid).then(() => {
          dispatch(setBoards(fetchedBoards));
          setIsLoading(false);
        });
      },
      () => {
        console.error("Error fetching boards");
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

  const getSortedBoards = (boards: Board[]): Board[] => {
    const boardWithPosition = boards.map((board) => ({
      ...board,
      position: typeof board.position === "number" ? board.position : 0,
    }));
    return boardWithPosition.sort((a, b) => a.position - b.position);
  };

  if (isLoading) {
    return <Loader1 />;
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
                  {boards.find((b) => b.id === selectedBoardId)?.title ||
                    "Board"}
                </span>
                {boards.find((b) => b.id === selectedBoardId)?.isDefault && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </h2>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <TaskBoard boards={getSortedBoards(boards)} />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white">
          <BoardsOverview
            boards={getSortedBoards(boards)}
            onSelectBoard={handleSelectBoard}
          />
        </div>
      )}
    </div>
  );
};

export default Tasks;
