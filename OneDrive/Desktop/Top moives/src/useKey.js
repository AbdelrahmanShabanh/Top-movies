import { useEffect } from "react";

export function useKey(key , action){
      useEffect(
        function () {
          document.addEventListener("keydown", function (e) {
            if (e.code.toLowerCase() === key.toLowerCase()) {
              action();
            }
          });
          return () => {
            document.removeEventListener("keydown", function (e) {
              if (e.code === key) {
                action();
              }
            });
          };
        },
        [action, key]
      );
}