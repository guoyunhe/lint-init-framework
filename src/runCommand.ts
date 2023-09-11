import { spawn } from "child_process";

export async function runCommand(command: string) {
  return new Promise<number | null>((resolve) => {
    const child = spawn(command, {
      shell: true,
    });

    const handleCancel = () => {
      // child.kill();
    };

    child.on('exit', (code) => {
      resolve(code);
      ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => process.off(signal, handleCancel));
    });
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => process.on(signal, handleCancel));
  });
}
