/**
 * userSlider 需要实现的逻辑是：按住滑动选择器的圆形手柄区域并拖动可以调节数值大小，数值范围为 0 到 1。
 */
import { useEffect, useCallback, useRef, useReducer } from "react";

//action-type
const START = "START";
const MOVE = "MOVE";
const END = "END";
const SET = "SET";
const TO = "TO";

//限定0=<ratio<=1
const fixRatio = (ratio) => {
  return Math.max(0, Math.min(1, ratio));
};

/**
 * 
 * defaultState={
        horizon:true//是否横向
        ratio: 0.5, //当前已滑动的了长度（ratio=lastRatio+(nowPos-lastPos)/slideRange）
        reset: true,//是否是直接重置
        slideRange:"", //可滑动滑动的总距离（滑块div的长度或高度）
        sliding:true, //正在滑动中》》只要正在滑动中才能移动滑块
        lastPos:"",//上一次滑块所在的位置
 * }
 */

/**
 *
 * @param {*} state
 * @param {*} action
 * return newState
 */
const reducer = (state, action) => {
  //当前滑块滑动方向标志
  const { horizon } = state;
  const { type } = action;
  switch (type) {
    /**
     * 鼠标点击按下，开始设置可以滑动标志
     * 记录当前滑块位置
     */
    case START:
      return {
        ...state,
        sliding: true,
        reset: false,
        slideRange: horizon ? action.slideWidth : action.slideHeight,
        lastPos: horizon ? action.x : -action.y, //y是负数是因为滑块往上是增加方向，而y是一直是负数
      };
    case MOVE:
      if (!state.sliding) {
        return state;
      } else {
        const nowPos = horizon ? action.x : -action.y;
        const delta = nowPos - state.lastPos;
        return {
          ...state,
          lastPos: nowPos,
          ratio: fixRatio(state.ratio + delta / state.slideRange),
          reset: false,
        };
      }
    case END:
      if (!state.sliding) {
        return state;
      }
      //       const nowPos = horizon ? action.x : -action.y;
      //       const delta = nowPos - state.lastPos;
      return {
        ...state,
        //  lastPos: nowPos,
        //  ratio: fixRatio(state.ratio + delta / state.slideRange),
        reset: false,
        sliding: false, //结束时候除了要记录位置还要关闭滑动标志
      };
    case SET:
      if (!action.reset || action.ratio !== state.ratio) {
        //防止重复触发
        return {
          ...state,
          reset: true,
          ratio: fixRatio(action.ratio),
        };
      }
      return state;
    //直接跳到某一点
    case TO:
      
      return {
        ...state,
        reset: false,
        sliding: false,
        ratio: fixRatio(
          horizon
            ? action.x / action.slideWidth
            : (action.slideHeight - action.y) / action.slideHeight
        ),
      };
    default:
      return state;
  }
};
/**
 * @description  Hook：监听滑块滑动事件，暴露滑动方法
 * @param {*} props
 */
const useSlider = (props) => {
  const { horizon, initRatio = 0 } = props;
  //useReducer代替useState管理状态
  const [state, dispatch] = useReducer(reducer, {
    horizon,
    ratio: initRatio,
    reset: true,
  });

  //滑块条的引用
  const hotAreaRef = useRef(null);
  //滑动模块引用
  const thumbRef = useRef(null);
  //滑块条点击事件
  const handleHotAreaMouseDown = useCallback((e) => {
    const hotArea = hotAreaRef.current;
    console.log(
      11,
      window.getComputedStyle(hotArea),
      hotArea.getBoundingClientRect()
    );

    dispatch({
      type: TO,
      x: e.touches[0].pageX - hotArea.getBoundingClientRect().left, //相对父元素的x方向偏移
      y: e.touches[0].pageY - hotArea.getBoundingClientRect().top,
      slideHeight: parseFloat(window.getComputedStyle(hotArea).height),
      slideWidth: parseFloat(window.getComputedStyle(hotArea).width),
    });
  }, []);

  //滑动模块点击事件
  const handleThumbMouseDown = useCallback((e) => {
    const hotArea = hotAreaRef.current;
    dispatch({
      type: START,
      x: e.touches[0].pageX, //相对document的x方向偏移
      y: e.touches[0].pageY,
      slideWidth: hotArea.clientWidth,
      slideHeight: hotArea.clientHeight,
    });
  }, []);
  //设置滑动模块位置
  const setRatio = useCallback((ratio) => {
    dispatch({
      type: SET,
      ratio, //比例
    });
  }, []);

  useEffect(() => {
    const onSliding = (e) => {
      

      dispatch({
        type: MOVE,
        x: e.touches[0].pageX,
        y: e.touches[0].pageY,
      });
    };

    const onSlideEnd = (e) => {
      
      dispatch({
        type: END,
        //  x: e.touches[0].pageX,
        //  y: e.touches[0].pageY,
      });
    };

    //     document.addEventListener("mousemove", onSliding);
    //     document.addEventListener("mouseup", onSlideEnd);
    //触摸事件
    document.addEventListener("touchmove", onSliding);
    document.addEventListener("touchend", onSlideEnd);
    return () => {
      //       document.removeEventListener("mousemove", onSliding);
      //       document.removeEventListener("mouseup", onSlideEnd);

      document.removeEventListener("touchmove", onSliding);
      document.removeEventListener("touchend", onSlideEnd);
    };
  }, []);

  return [
    {
      ref: hotAreaRef,
      //       onMouseDown: handleHotAreaMouseDown,
      onTouchStart: handleHotAreaMouseDown,
    },
    {
      ref: thumbRef,
      //       onMouseDown: handleThumbMouseDown,
      onTouchStart: handleThumbMouseDown,
    },
    {
      ratio: state.ratio,
      setRatio,
      sliding: state.sliding, //是否滑动中
      reset: state.reset, //是否重置
    },
  ];
};
export default useSlider;
