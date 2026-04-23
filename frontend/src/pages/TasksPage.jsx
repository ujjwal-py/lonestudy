import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';

const TasksPage = () => {
  return (
    <div className="app-shell flex flex-col">
      <Navbar />
      <main className="flex-1 p-5 max-w-[1200px] w-full mx-auto">
        <TaskList />
      </main>
    </div>
  );
};

export default TasksPage;
