import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/Layout";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

function App(): React.JSX.Element {
  return (
    <Theme theme={neutralTheme}>
      <VStack gap={2}>
        <Button label="Hello Astryx" onClick={() => alert("Hi!")} />
      </VStack>
    </Theme>
  );
}

export default App;
