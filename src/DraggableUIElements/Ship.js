import React from 'react';


function Ship() {
  return (
    <div className="ui-container-body">
      <div className="uic-ship">
                    <div className="uic-ship-bar-container uic-align-left uic-ship-hp-container">
                        <div className="uic-ship-bar-wrapper">
                            <div id="uic-ship-hp-bar" className="ui-ship-bar" style={{width: "80%"}}></div>
                        </div>
                        <div className="uic-align-left uic-bar-undertext uic-bar-undertext-left">423543 / 1250000</div>
                    </div>

                    <div className="uic-ship-bar-container uic-align-right uic-ship-shield-container">
                        <div className="uic-ship-bar-wrapper uic-align-right">
                            <div id="uic-ship-cargo-bar" className="ui-ship-bar" style={{width: "80%"}}></div>
                        </div>
                        <div className="uic-align-right uic-bar-undertext uic-bar-undertext-right">4549 / 20000</div>
                    </div>

                </div>
                <div className="uic-ship">
                    <div className="uic-ship-bar-container uic-align-left">
                        <div className="uic-ship-bar-wrapper">
                            <div id="uic-ship-shield-bar" className="ui-ship-bar" style={{width: "80%"}}></div>
                        </div>
                        <div className="uic-align-left uic-bar-undertext uic-bar-undertext-left">7000 / 10000</div>
                    </div>

                    <div className="uic-ship-bar-container uic-align-right">
                        <div className="uic-ship-bar-wrapper uic-align-right">
                            <div id="uic-ship-energy-bar" className="ui-ship-bar" style={{width: "80%"}}></div>
                        </div>
                        <div className="uic-align-right uic-bar-undertext uic-bar-undertext-right">10000 / 10000</div>
                    </div>
                    
                </div>
    </div>
  );
}

export default Ship;