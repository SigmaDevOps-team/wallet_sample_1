import { withRouter } from 'react-router-dom';
import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'
import getCurrencyKey from "helpers/getCurrencyKey";
import { FormattedMessage } from 'react-intl'
import getWalletLink from 'helpers/getWalletLink'
import redirectTo from 'helpers/redirectTo'


class Transaction extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isFetching: true,
      infoTx: false,
    }
  }

  async fetchTxInfo(currencyKey, txId) {

    const infoTx = await actions[currencyKey].fetchTxInfo(txId, 5*60*1000)

    if(!infoTx) {
      // Fail parse
      return
    }
    this.setState({
      isFetching: false,
      infoTx,
    }, () => {
      this.updateTxInfoModal()
    })
  }

  updateTxInfoModal() {
    const {
      history,
    } = this.props

    const {
      currency,
      txId,
      infoTx,
      infoModal
    } = this.state

    infoModal.setState({
      amount:infoTx.amount,
      balance:0,
      oldBalance: infoTx.afterBalance,
      confirmed: infoTx.confirmed,
      sender: infoTx.senderAddress,
      toAddress: infoTx.receiverAddress,
      isFetching: false,
    })
  }

  componentWillMount() {
    let {
      history,
      match: {
        params: {
          ticker = null,
          tx: txId = null,
        }
      } = null
    } = this.props

    if(!txId) {
      // 404
      return
    }

    const currency = getCurrencyKey(ticker)

    this.setState({
      currency,
      ticker,
      txId,
    }, () => {
      actions.modals.open(constants.modals.InfoPay, {
        currency: ticker,
        txId,
        onClose: () => {
          let {
            infoTx: {
              senderAddress: walletOne,
              receiverAddress: walletTwo,
            },
          } = this.state

          const wallets = []
          if (walletOne instanceof Array) {
            walletOne.forEach((wallet) => wallets.push(wallet))
          } else wallets.push(walletOne)
          
          if (walletTwo instanceof Array) {
            walletTwo.forEach((wallet) => wallets.push(wallet))
          } else wallets.push(walletTwo)

          const walletLink = getWalletLink(ticker, wallets)
          redirectTo((walletLink) ? walletLink : '/')
        },
        isFetching: true,
        onFetching: (infoModal) => {
          this.setState({
            infoModal,
          }, () => {
            this.fetchTxInfo(currency, txId)
          })
        }
      }) 
      
      
    })
  }

  render() {
    const { isFetching } = this.state
    
    if (isFetching) {
      return (
        <div>
          <FormattedMessage id="Transaction_Pags_Fetching" defaultMessage="Fetching..." />
        </div>
      )
    }
    return (null);
  }
}

export default withRouter(Transaction);
