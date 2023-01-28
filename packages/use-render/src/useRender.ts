import useContext from './private/useContext';

export default function useRender<P>() {
  return useContext<P>().useRender;
}
