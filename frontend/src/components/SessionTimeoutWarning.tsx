import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Clock, AlertTriangle } from "lucide-react";

interface SessionTimeoutWarningProps {
  open: boolean;
  timeRemaining: number; // in seconds
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export const SessionTimeoutWarning = ({
  open,
  timeRemaining,
  onStayLoggedIn,
  onLogout,
}: SessionTimeoutWarningProps) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md bg-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <AlertDialogTitle className="text-xl text-gray-900">Session Timeout Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 text-gray-700">
            <p>
              Your session will expire due to inactivity. You will be automatically logged out in:
            </p>
            <div className="flex items-center justify-center gap-2 bg-gray-100 py-4 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-2xl font-bold text-gray-800">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Click "Stay Logged In" to continue your session, or "Logout" to end your session now.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row gap-3 justify-end sm:justify-end mt-4">
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md transition-colors border border-gray-300"
          >
            Logout
          </button>
          <button
            onClick={onStayLoggedIn}
            className="px-6 py-2 bg-violet2 hover:bg-pink-500 text-white font-semibold rounded-md transition-colors shadow-sm"
          >
            Stay Logged In
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
